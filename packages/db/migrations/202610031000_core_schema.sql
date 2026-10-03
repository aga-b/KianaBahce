-- K02-02: çekirdek şema. Kapsam dışı: resource_allocation, booking, exclusion constraint, btree_gist (K05).
-- Tüm alan tabloları organization_id taşır; çocuk -> ebeveyn bağları (organization_id, id) bileşik FK ile kurulur,
-- böylece farklı işletmenin ebeveynine bağlanma DB tarafından reddedilir.

CREATE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$;

CREATE TABLE organization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  timezone text NOT NULL DEFAULT 'Europe/Istanbul' CHECK (length(btrim(timezone)) > 0),
  default_currency char(3) NOT NULL DEFAULT 'TRY' CHECK (default_currency ~ '^[A-Z]{3}$'),
  contact_email text,
  contact_phone text,
  settings_version integer NOT NULL DEFAULT 1 CHECK (settings_version >= 1),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE venue_space (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization (id),
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  capacity_max integer CHECK (capacity_max IS NULL OR capacity_max > 0),
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  UNIQUE (organization_id, slug)
);

CREATE TABLE resource (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization (id),
  kind text NOT NULL CHECK (kind IN ('physical_space', 'staff', 'visit_space')),
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id)
);

CREATE TABLE space_resource (
  organization_id uuid NOT NULL,
  space_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (space_id, resource_id),
  FOREIGN KEY (organization_id, space_id) REFERENCES venue_space (organization_id, id),
  FOREIGN KEY (organization_id, resource_id) REFERENCES resource (organization_id, id)
);
CREATE INDEX space_resource_resource_idx ON space_resource (organization_id, resource_id);

-- Yerel saat başlangıcı + süre: gece yarısını aşan seans desteklenir. Tamponlar dakika cinsindendir.
CREATE TABLE session_template (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization (id),
  space_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  start_local time NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  setup_buffer_minutes integer NOT NULL DEFAULT 0 CHECK (setup_buffer_minutes >= 0),
  teardown_buffer_minutes integer NOT NULL DEFAULT 0 CHECK (teardown_buffer_minutes >= 0),
  is_active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, space_id) REFERENCES venue_space (organization_id, id)
);

-- space_id NULL: işletme geneli kural. weekday ISO (1=Pazartesi .. 7=Pazar). Tarih aralığı [date_from, date_to] (gün dahil).
CREATE TABLE opening_rule (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organization (id),
  space_id uuid,
  session_template_id uuid,
  rule_kind text NOT NULL CHECK (rule_kind IN ('open', 'closed')),
  weekday smallint CHECK (weekday IS NULL OR weekday BETWEEN 1 AND 7),
  date_from date,
  date_to date,
  note text,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (organization_id, id),
  FOREIGN KEY (organization_id, space_id) REFERENCES venue_space (organization_id, id),
  FOREIGN KEY (organization_id, session_template_id) REFERENCES session_template (organization_id, id),
  CHECK (weekday IS NOT NULL OR date_from IS NOT NULL),
  CHECK ((date_from IS NULL) = (date_to IS NULL)),
  CHECK (date_to IS NULL OR date_to >= date_from)
);

CREATE INDEX venue_space_org_idx ON venue_space (organization_id) WHERE is_active;
CREATE INDEX resource_org_kind_idx ON resource (organization_id, kind) WHERE is_active;
CREATE INDEX session_template_space_idx ON session_template (organization_id, space_id);
CREATE INDEX opening_rule_space_idx ON opening_rule (organization_id, space_id);

CREATE TRIGGER organization_updated_at BEFORE UPDATE ON organization FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER venue_space_updated_at BEFORE UPDATE ON venue_space FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER resource_updated_at BEFORE UPDATE ON resource FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER session_template_updated_at BEFORE UPDATE ON session_template FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER opening_rule_updated_at BEFORE UPDATE ON opening_rule FOR EACH ROW EXECUTE FUNCTION set_updated_at();
