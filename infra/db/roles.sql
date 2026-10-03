-- Idempotent ve sırsız: parolalar bu betikte yoktur; ALTER ROLE ... PASSWORD ile dışarıdan verilir.
-- Superuser olarak hedef veritabanında çalıştırılır: psql -v ON_ERROR_STOP=1 -d <db> -f infra/db/roles.sql
DO $$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['kiana_migrator', 'kiana_app', 'kiana_worker'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I LOGIN', r);
    END IF;
    EXECUTE format('ALTER ROLE %I NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION', r);
  END LOOP;
END
$$;

-- public şemayı yalnız migrator oluşturabilir; runtime roller sahip değildir.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
DO $$
BEGIN
  EXECUTE format('GRANT ALL ON DATABASE %I TO kiana_migrator', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO kiana_app, kiana_worker', current_database());
  EXECUTE format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database());
END
$$;
GRANT USAGE, CREATE ON SCHEMA public TO kiana_migrator;
GRANT USAGE ON SCHEMA public TO kiana_app, kiana_worker;

-- Migrator'ın yarattığı tablolar: web tam DML alır, işçi yalnız okur (tablo bazında genişletilir).
ALTER DEFAULT PRIVILEGES FOR ROLE kiana_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kiana_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kiana_migrator IN SCHEMA public
  GRANT SELECT ON TABLES TO kiana_worker;
ALTER DEFAULT PRIVILEGES FOR ROLE kiana_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO kiana_app, kiana_worker;
