-- K02-04: event, üyelik ve davet şeması. Davet oluşturma/gönderme/kabul akışı K03/K06/K10'dadır.
--
-- Düğüne bağlı çocuk kayıt şablonu (sonraki kartlar kopyalar):
--   organization_id uuid NOT NULL, event_id uuid NOT NULL,
--   FOREIGN KEY (organization_id, event_id) REFERENCES event (organization_id, id)
-- Böylece başka işletmenin event'ine bağlanma DB tarafından reddedilir.

CREATE TABLE event (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization (id),
  -- Kontrollü değer: yalnız düğün açık. Yeni tür migration ile açılır.
  event_type text NOT NULL DEFAULT 'wedding' CHECK (event_type IN ('wedding')),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  -- Yazma kapatma, saklama/silme politikasından bağımsızdır. İptal edilen etkinlik yazmaya kapanır.
  write_state text NOT NULL DEFAULT 'open' CHECK (write_state IN ('open', 'closed')),
  cancelled_at timestamptz,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  CHECK ((status = 'cancelled') = (cancelled_at IS NOT NULL)),
  CHECK (status <> 'cancelled' OR write_state = 'closed')
);

-- K02-03'te ertelenen bağ.
ALTER TABLE staff_assignment
  ADD CONSTRAINT staff_assignment_event_fk
  FOREIGN KEY (organization_id, event_id) REFERENCES event (organization_id, id);

-- Üye müşteri kimliğidir (customer_user); personel buraya bağlanamaz.
-- Rol + açık izin seti: yakın rolü şemada desteklenir, uygulama bayrağıyla kapalı kalabilir.
CREATE TABLE event_member (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  event_id uuid NOT NULL,
  customer_user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('couple_member', 'close_helper')),
  permissions text[] NOT NULL DEFAULT '{}'
    CHECK (permissions <@ ARRAY['plan.view','board.view','board.edit','chat.participate','documents.view','payments.view','member.invite']::text[]),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, event_id, customer_user_id),
  FOREIGN KEY (organization_id, event_id) REFERENCES event (organization_id, id),
  FOREIGN KEY (organization_id, customer_user_id) REFERENCES customer_user (organization_id, id)
);

-- Davet tek hedef kanala bağlanır; token düz metin saklanmaz (yalnız SHA-256 özeti, 32 bayt).
CREATE TABLE event_invitation (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  event_id uuid NOT NULL,
  target_channel text NOT NULL CHECK (target_channel IN ('email', 'phone')),
  target_email text CHECK (target_email IS NULL OR (target_email = lower(target_email) AND target_email LIKE '%_@_%')),
  target_phone_e164 text CHECK (target_phone_e164 IS NULL OR target_phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  role text NOT NULL CHECK (role IN ('couple_member', 'close_helper')),
  permissions text[] NOT NULL DEFAULT '{}'
    CHECK (permissions <@ ARRAY['plan.view','board.view','board.edit','chat.participate','documents.view','payments.view','member.invite']::text[]),
  token_hash bytea NOT NULL CHECK (octet_length(token_hash) = 32),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  consumed_by_customer_user_id uuid,
  failed_attempts integer NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  created_by_staff_user_id uuid,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  UNIQUE (token_hash),
  CHECK ((target_channel = 'email' AND target_email IS NOT NULL AND target_phone_e164 IS NULL)
      OR (target_channel = 'phone' AND target_phone_e164 IS NOT NULL AND target_email IS NULL)),
  CHECK ((consumed_at IS NULL) = (consumed_by_customer_user_id IS NULL)),
  CHECK (expires_at > created_at),
  FOREIGN KEY (organization_id, event_id) REFERENCES event (organization_id, id),
  FOREIGN KEY (organization_id, consumed_by_customer_user_id) REFERENCES customer_user (organization_id, id),
  FOREIGN KEY (organization_id, created_by_staff_user_id) REFERENCES staff_user (organization_id, id)
);

CREATE INDEX event_member_customer_idx ON event_member (organization_id, customer_user_id);
CREATE INDEX event_invitation_event_idx ON event_invitation (organization_id, event_id);

CREATE TRIGGER event_updated_at BEFORE UPDATE ON event FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER event_member_updated_at BEFORE UPDATE ON event_member FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER event_invitation_updated_at BEFORE UPDATE ON event_invitation FOR EACH ROW EXECUTE FUNCTION set_updated_at();
