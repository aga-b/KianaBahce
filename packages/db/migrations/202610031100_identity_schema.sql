-- K02-03: kimlik ve personel üyelik şeması. Giriş akışları, parola, TOTP ve oturum K03'tedir.
-- Better Auth tabloları K03'te kütüphane şemasıyla bu iki ayrı namespace'e gelir.

CREATE SCHEMA auth_customer;
CREATE SCHEMA auth_staff;
REVOKE ALL ON SCHEMA auth_customer, auth_staff FROM PUBLIC;
GRANT USAGE ON SCHEMA auth_customer, auth_staff TO kiana_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kiana_migrator IN SCHEMA auth_customer
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kiana_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kiana_migrator IN SCHEMA auth_staff
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kiana_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kiana_migrator IN SCHEMA auth_customer
  GRANT USAGE, SELECT ON SEQUENCES TO kiana_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kiana_migrator IN SCHEMA auth_staff
  GRANT USAGE, SELECT ON SEQUENCES TO kiana_app;

-- Aktör türü (§8.1): farklı kimlik alanlarında eşit ID aynı kişi demek değildir; aktör referansları bu türü içerir.
CREATE DOMAIN actor_kind AS text CHECK (VALUE IN ('customer', 'staff', 'system'));

-- Müşteri ve personel ayrı tablolardır; aralarında FK, ortak unique veya e-posta eşleştirmesi yoktur.
-- E-posta kimlik anahtarı değildir (Apple gizli adres, Facebook e-postasız).
CREATE TABLE customer_user (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization (id),
  display_name text,
  contact_email text,
  contact_email_verified_at timestamptz,
  phone_e164 text CHECK (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  phone_verified_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'locked', 'deleted')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  CHECK (phone_verified_at IS NULL OR phone_e164 IS NOT NULL)
);

CREATE TABLE staff_user (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization (id),
  display_name text,
  contact_email text,
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'locked', 'deleted')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id)
);

-- İzinler ve roller veridir; kodda sabit isAdmin bayrağı yoktur. Roller yalnız izin paketidir.
CREATE TABLE permission (
  key text PRIMARY KEY CHECK (key ~ '^[a-z]+(\.[a-z_]+)+$'),
  description text NOT NULL
);

CREATE TABLE staff_role (
  key text PRIMARY KEY CHECK (key ~ '^[a-z]+(_[a-z]+)*$'),
  name text NOT NULL,
  description text NOT NULL
);

CREATE TABLE staff_role_permission (
  role_key text NOT NULL REFERENCES staff_role (key),
  permission_key text NOT NULL REFERENCES permission (key),
  PRIMARY KEY (role_key, permission_key)
);

INSERT INTO permission (key, description) VALUES
  ('booking.confirm', 'Rezervasyonu kesinleştirir'),
  ('notification.sms.send', 'SMS gönderir'),
  ('publication.publish', 'İçerik veya davetiye yayımlar'),
  ('finance.record', 'Ödeme ve finans kaydı girer'),
  ('member.invite', 'Düğüne üye davet eder'),
  ('export.private', 'Özel veriyi dışa aktarır'),
  ('staff.manage', 'Personel hesabı ve yetkilerini yönetir');

INSERT INTO staff_role (key, name, description) VALUES
  ('business_owner', 'İşletme sahibi', 'Personel yetkileri, sağlayıcı ayarları, kritik kurtarma ve denetim'),
  ('business_manager', 'İşletme yöneticisi', 'Operasyon, atamalar, onaylar, limitler'),
  ('reservation_clerk', 'Rezervasyon görevlisi', 'Talep, takvim, tutma, teklif; kesinleştirme ve fiyat istisnası ayrı izin'),
  ('finance_officer', 'Finans görevlisi', 'Ödeme planı ve kayıt'),
  ('content_editor', 'İçerik editörü', 'Genel site ve kurumsal galeri; müşteri verisi yok'),
  ('coordinator', 'Koordinatör', 'Atandığı düğünlerde hazırlık ve müşteri iletişimi; SMS ayrıca izin gerektirir');

INSERT INTO staff_role_permission (role_key, permission_key)
SELECT 'business_owner', key FROM permission;
INSERT INTO staff_role_permission (role_key, permission_key) VALUES
  ('business_manager', 'booking.confirm'),
  ('business_manager', 'notification.sms.send'),
  ('business_manager', 'publication.publish'),
  ('business_manager', 'member.invite'),
  ('finance_officer', 'finance.record'),
  ('content_editor', 'publication.publish');

-- Çalışma zamanı rolleri referans verilerini okuyabilir ama değiştiremez.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON permission, staff_role, staff_role_permission FROM kiana_app, kiana_worker;

CREATE TABLE staff_membership (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  staff_user_id uuid NOT NULL,
  role_key text NOT NULL REFERENCES staff_role (key),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, staff_user_id),
  FOREIGN KEY (organization_id, staff_user_id) REFERENCES staff_user (organization_id, id)
);

-- Role ek olarak verilen izinler ("izin listesi"); etkin izin = rol izinleri + bu satırlar.
CREATE TABLE staff_membership_permission (
  organization_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  permission_key text NOT NULL REFERENCES permission (key),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (membership_id, permission_key),
  FOREIGN KEY (organization_id, membership_id) REFERENCES staff_membership (organization_id, id)
);

-- event_id'ye FK, event tablosu geldiğinde K02-04'te eklenir.
CREATE TABLE staff_assignment (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  event_id uuid NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, membership_id, event_id),
  FOREIGN KEY (organization_id, membership_id) REFERENCES staff_membership (organization_id, id)
);

CREATE INDEX staff_assignment_event_idx ON staff_assignment (organization_id, event_id);

CREATE TRIGGER customer_user_updated_at BEFORE UPDATE ON customer_user FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER staff_user_updated_at BEFORE UPDATE ON staff_user FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER staff_membership_updated_at BEFORE UPDATE ON staff_membership FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER staff_assignment_updated_at BEFORE UPDATE ON staff_assignment FOR EACH ROW EXECUTE FUNCTION set_updated_at();
