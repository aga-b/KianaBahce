import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pg from "pg";
import { migrate, poolMaxFromEnv } from "../../../packages/db/src/index.ts";
import { createTestDb, type TestDb } from "./db.ts";

let tdb: TestDb;
beforeAll(async () => {
  tdb = await createTestDb();
});
afterAll(async () => {
  await tdb?.drop();
});

async function as<T>(
  url: string,
  fn: (c: pg.Client) => Promise<T>,
): Promise<T> {
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

describe("DB rolleri (K02-01)", () => {
  it.each(["kiana_app", "kiana_worker", "kiana_migrator"] as const)(
    "%s superuser değil, BYPASSRLS yok, rol/DB yaratamaz",
    async (role) => {
      const row = await as(tdb.url(role), async (c) => {
        const s = await c.query("SELECT current_setting('is_superuser') AS su");
        const r = await c.query(
          "SELECT rolsuper, rolbypassrls, rolcreaterole, rolcreatedb FROM pg_roles WHERE rolname = current_user",
        );
        return { su: s.rows[0].su, ...r.rows[0] };
      });
      expect(row).toEqual({
        su: "off",
        rolsuper: false,
        rolbypassrls: false,
        rolcreaterole: false,
        rolcreatedb: false,
      });
    },
  );

  it("kiana_app tablo sahibi değildir ve şema nesnesi yaratamaz", async () => {
    await expect(
      as(tdb.url("kiana_app"), (c) =>
        c.query("CREATE TABLE public.x (id int)"),
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("roles.sql ikinci kez çalıştırılınca hata vermez", async () => {
    const { readFileSync } = await import("node:fs");
    const sql = readFileSync(
      new URL("../../../infra/db/roles.sql", import.meta.url),
      "utf8",
    );
    await as(tdb.adminUrl, (c) => c.query(sql));
  });
});

describe("Migration çalıştırıcısı (K02-01)", () => {
  it("migrator'ın tablosu app'e DML, worker'a yalnız SELECT verir; ikinci çalıştırma değişiklik yapmaz", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mig-"));
    await writeFile(
      join(dir, "202601010000_t_probe.sql"),
      "CREATE TABLE t_probe (id int PRIMARY KEY);\n",
    );
    await writeFile(
      join(dir, "202601010001_t_probe_row.sql"),
      "INSERT INTO t_probe VALUES (1);\n",
    );
    const url = tdb.url("kiana_migrator");
    const first = await migrate({ connectionString: url, dir });
    expect(first.applied).toHaveLength(2);
    const second = await migrate({ connectionString: url, dir });
    expect(second.applied).toEqual([]);
    expect(second.skipped).toHaveLength(2);

    await as(tdb.url("kiana_app"), (c) =>
      c.query("INSERT INTO t_probe VALUES (2)"),
    );
    await expect(
      as(tdb.url("kiana_worker"), (c) =>
        c.query("INSERT INTO t_probe VALUES (3)"),
      ),
    ).rejects.toMatchObject({
      code: "42501",
    });
    const rows = await as(tdb.url("kiana_worker"), (c) =>
      c.query("SELECT count(*)::int AS n FROM t_probe"),
    );
    expect(rows.rows[0].n).toBe(2);
  });

  it("runtime kimlik bilgisiyle çalışmayı reddeder", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mig-"));
    await expect(
      migrate({ connectionString: tdb.url("kiana_app"), dir }),
    ).rejects.toThrow(/Migrations must run as/);
    await expect(
      migrate({ connectionString: tdb.url("kiana_worker"), dir }),
    ).rejects.toThrow(/Migrations must run as/);
  });

  it("uygulanmış migration'ın değiştirilmesini ve geçersiz dosya adını reddeder", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mig-"));
    const file = join(dir, "202601020000_t_mut.sql");
    await writeFile(file, "SELECT 1;\n");
    await migrate({ connectionString: tdb.url("kiana_migrator"), dir });
    await writeFile(file, "SELECT 2;\n");
    await expect(
      migrate({ connectionString: tdb.url("kiana_migrator"), dir }),
    ).rejects.toThrow(/was modified/);
    await writeFile(join(dir, "bad-name.sql"), "SELECT 1;\n");
    await expect(
      migrate({ connectionString: tdb.url("kiana_migrator"), dir }),
    ).rejects.toThrow(/Invalid migration file name/);
  });

  it("başarısız migration geri alınır ve kayda geçmez", async () => {
    const dir = await mkdtemp(join(tmpdir(), "mig-"));
    await writeFile(
      join(dir, "202601030000_t_fail.sql"),
      "CREATE TABLE t_half (id int); SELECT 1/0;\n",
    );
    await expect(
      migrate({ connectionString: tdb.url("kiana_migrator"), dir }),
    ).rejects.toThrow();
    const r = await as(tdb.url("kiana_migrator"), (c) =>
      c.query("SELECT to_regclass('public.t_half') AS t"),
    );
    expect(r.rows[0].t).toBeNull();
  });
});

describe("Bağlantı havuzu", () => {
  it("DB_POOL_MAX env'den okunur ve doğrulanır", () => {
    expect(poolMaxFromEnv({})).toBe(10);
    expect(poolMaxFromEnv({ DB_POOL_MAX: "5" })).toBe(5);
    expect(() => poolMaxFromEnv({ DB_POOL_MAX: "0" })).toThrow();
    expect(() => poolMaxFromEnv({ DB_POOL_MAX: "abc" })).toThrow();
  });
});
