import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

const FILE_PATTERN = /^\d{12}_[a-z0-9_]+\.sql$/;
const LOCK_KEY = 74_219_001;

export type MigrationFile = { name: string; sql: string; checksum: string };
export type MigrateResult = { applied: string[]; skipped: string[] };

export async function loadMigrations(dir: string): Promise<MigrationFile[]> {
  const entries = (await readdir(dir)).filter((f) => !f.startsWith("."));
  const bad = entries.filter((f) => !FILE_PATTERN.test(f));
  if (bad.length > 0) {
    throw new Error(
      `Invalid migration file name(s): ${bad.join(", ")} (expected YYYYMMDDHHMM_name.sql)`,
    );
  }
  const names = entries.sort();
  const files: MigrationFile[] = [];
  for (const name of names) {
    const sql = await readFile(join(dir, name), "utf8");
    files.push({
      name,
      sql,
      checksum: createHash("sha256").update(sql).digest("hex"),
    });
  }
  return files;
}

export async function migrate(options: {
  connectionString: string;
  dir: string;
  allowedRoles?: string[];
}): Promise<MigrateResult> {
  const allowed = options.allowedRoles ?? ["kiana_migrator"];
  const files = await loadMigrations(options.dir);
  const client = new pg.Client({ connectionString: options.connectionString });
  await client.connect();
  try {
    const who = await client.query("SELECT current_user AS u");
    const role = String(who.rows[0].u);
    if (!allowed.includes(role)) {
      throw new Error(
        `Migrations must run as ${allowed.join(" or ")}, not as the connected role`,
      );
    }
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_KEY]);
    try {
      await client.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
           name text PRIMARY KEY,
           checksum text NOT NULL,
           applied_at timestamptz NOT NULL DEFAULT now()
         )`,
      );
      const done = new Map<string, string>(
        (
          await client.query("SELECT name, checksum FROM schema_migrations")
        ).rows.map((r: { name: string; checksum: string }) => [
          r.name,
          r.checksum,
        ]),
      );
      const result: MigrateResult = { applied: [], skipped: [] };
      for (const file of files) {
        const prev = done.get(file.name);
        if (prev !== undefined) {
          if (prev !== file.checksum) {
            throw new Error(
              `Applied migration was modified: ${file.name} (write a new migration instead)`,
            );
          }
          result.skipped.push(file.name);
          continue;
        }
        await client.query("BEGIN");
        try {
          await client.query(file.sql);
          await client.query(
            "INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)",
            [file.name, file.checksum],
          );
          await client.query("COMMIT");
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        }
        result.applied.push(file.name);
      }
      return result;
    } finally {
      await client.query("SELECT pg_advisory_unlock($1)", [LOCK_KEY]);
    }
  } finally {
    await client.end();
  }
}
