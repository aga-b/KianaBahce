import { createHash, randomBytes } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { migrate } from "../../../packages/db/src/migrate/runner.ts";
import { testDatabaseUrl } from "./pg.ts";

export const ROLE_PASSWORD = "kiana_test_only";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const migrationsDir = `${root}packages/db/migrations`;
const rolesSql = readFileSync(`${root}infra/db/roles.sql`, "utf8");

export function urlFor(
  base: string,
  user: string,
  password: string,
  database?: string,
): string {
  const u = new URL(base);
  u.username = user;
  u.password = password;
  if (database) u.pathname = `/${database}`;
  return u.toString();
}

function templateName(): string {
  const h = createHash("sha256").update(rolesSql);
  for (const f of readdirSync(migrationsDir)
    .filter((n) => n.endsWith(".sql"))
    .sort()) {
    h.update(f).update(readFileSync(`${migrationsDir}/${f}`));
  }
  return `kiana_tpl_${h.digest("hex").slice(0, 12)}`;
}

async function admin<T>(
  fn: (c: pg.Client) => Promise<T>,
  database?: string,
): Promise<T> {
  const url = new URL(testDatabaseUrl());
  if (database) url.pathname = `/${database}`;
  const c = new pg.Client({ connectionString: url.toString() });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

async function ensureTemplate(): Promise<string> {
  const name = templateName();
  await admin(async (c) => {
    await c.query("SELECT pg_advisory_lock(74219002)");
    try {
      const exists = await c.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [name],
      );
      if (exists.rowCount) return;
      await c.query(`CREATE DATABASE "${name}"`);
      try {
        await admin(async (t) => {
          await t.query("CREATE EXTENSION IF NOT EXISTS btree_gist");
          await t.query(rolesSql);
          for (const role of ["kiana_migrator", "kiana_app", "kiana_worker"]) {
            await t.query(`ALTER ROLE ${role} PASSWORD '${ROLE_PASSWORD}'`);
          }
        }, name);
        await migrate({
          connectionString: urlFor(
            testDatabaseUrl(),
            "kiana_migrator",
            ROLE_PASSWORD,
            name,
          ),
          dir: migrationsDir,
        });
      } catch (e) {
        await c.query(`DROP DATABASE IF EXISTS "${name}"`);
        throw e;
      }
    } finally {
      await c.query("SELECT pg_advisory_unlock(74219002)");
    }
  });
  return name;
}

export type TestDb = {
  name: string;
  url: (role: "kiana_migrator" | "kiana_app" | "kiana_worker") => string;
  adminUrl: string;
  drop: () => Promise<void>;
};

export async function createTestDb(): Promise<TestDb> {
  const tpl = await ensureTemplate();
  const name = `kiana_t_${randomBytes(6).toString("hex")}`;
  await admin((c) => c.query(`CREATE DATABASE "${name}" TEMPLATE "${tpl}"`));
  return {
    name,
    url: (role) => urlFor(testDatabaseUrl(), role, ROLE_PASSWORD, name),
    adminUrl: urlFor(
      testDatabaseUrl(),
      new URL(testDatabaseUrl()).username,
      decodeURIComponent(new URL(testDatabaseUrl()).password),
      name,
    ),
    drop: () =>
      admin((c) =>
        c.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`),
      ).then(() => undefined),
  };
}
