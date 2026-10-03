import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { createTestDb, type TestDb } from "./helpers/db.ts";

let tdb: TestDb;
let c: pg.Client;
let orgA: string;
let orgB: string;
let spaceA: string;
let resourceA: string;
let spaceB: string;
let resourceB: string;

async function id(sql: string, params: unknown[]): Promise<string> {
  const r = await c.query(sql, params);
  return r.rows[0].id;
}

beforeAll(async () => {
  tdb = await createTestDb();
  c = new pg.Client({ connectionString: tdb.url("kiana_app") });
  await c.connect();
  orgA = await id(
    "INSERT INTO organization (name) VALUES ('Test A') RETURNING id",
    [],
  );
  orgB = await id(
    "INSERT INTO organization (name) VALUES ('Test B') RETURNING id",
    [],
  );
  spaceA = await id(
    "INSERT INTO venue_space (organization_id, name, slug) VALUES ($1,'S','s-a') RETURNING id",
    [orgA],
  );
  spaceB = await id(
    "INSERT INTO venue_space (organization_id, name, slug) VALUES ($1,'S','s-b') RETURNING id",
    [orgB],
  );
  resourceA = await id(
    "INSERT INTO resource (organization_id, kind, name) VALUES ($1,'physical_space','R') RETURNING id",
    [orgA],
  );
  resourceB = await id(
    "INSERT INTO resource (organization_id, kind, name) VALUES ($1,'staff','R') RETURNING id",
    [orgB],
  );
});
afterAll(async () => {
  await c?.end();
  await tdb?.drop();
});

const rejects = (sql: string, params: unknown[], code: string) =>
  expect(c.query(sql, params)).rejects.toMatchObject({ code });

describe("çekirdek şema (K02-02)", () => {
  it("varsayılanlar: Europe/Istanbul, TRY, sürüm 1, timestamptz", async () => {
    const r = await c.query(
      "SELECT timezone, default_currency, settings_version, version, pg_typeof(created_at)::text AS t FROM organization WHERE id=$1",
      [orgA],
    );
    expect(r.rows[0]).toEqual({
      timezone: "Europe/Istanbul",
      default_currency: "TRY",
      settings_version: 1,
      version: 1,
      t: "timestamp with time zone",
    });
  });

  it("aynı işletmede space_resource bağlanır", async () => {
    await c.query(
      "INSERT INTO space_resource (organization_id, space_id, resource_id) VALUES ($1,$2,$3)",
      [orgA, spaceA, resourceA],
    );
  });

  it("farklı işletmenin alanına/kaynağına space_resource bağlama DB tarafından reddedilir (23503)", async () => {
    await rejects(
      "INSERT INTO space_resource (organization_id, space_id, resource_id) VALUES ($1,$2,$3)",
      [orgA, spaceB, resourceA],
      "23503",
    );
    await rejects(
      "INSERT INTO space_resource (organization_id, space_id, resource_id) VALUES ($1,$2,$3)",
      [orgA, spaceA, resourceB],
      "23503",
    );
  });

  it("farklı işletmenin alanına session_template ve opening_rule bağlanamaz (23503)", async () => {
    await rejects(
      "INSERT INTO session_template (organization_id, space_id, name, start_local, duration_minutes) VALUES ($1,$2,'x','10:00',60)",
      [orgA, spaceB],
      "23503",
    );
    await rejects(
      "INSERT INTO opening_rule (organization_id, space_id, rule_kind, weekday) VALUES ($1,$2,'open',1)",
      [orgA, spaceB],
      "23503",
    );
  });

  it("check kısıtları: kind, kapasite, süre, tampon, weekday, tarih aralığı, para birimi, slug (23514)", async () => {
    await rejects(
      "INSERT INTO resource (organization_id, kind, name) VALUES ($1,'other','x')",
      [orgA],
      "23514",
    );
    await rejects(
      "INSERT INTO venue_space (organization_id,name,slug,capacity_max) VALUES ($1,'x','ok',0)",
      [orgA],
      "23514",
    );
    await rejects(
      "INSERT INTO venue_space (organization_id,name,slug) VALUES ($1,'x','Bad Slug')",
      [orgA],
      "23514",
    );
    await rejects(
      "INSERT INTO organization (name, default_currency) VALUES ('x','try')",
      [],
      "23514",
    );
    await rejects(
      "INSERT INTO session_template (organization_id,space_id,name,start_local,duration_minutes) VALUES ($1,$2,'x','10:00',0)",
      [orgA, spaceA],
      "23514",
    );
    await rejects(
      "INSERT INTO session_template (organization_id,space_id,name,start_local,duration_minutes,setup_buffer_minutes) VALUES ($1,$2,'x','10:00',60,-1)",
      [orgA, spaceA],
      "23514",
    );
    await rejects(
      "INSERT INTO opening_rule (organization_id, rule_kind, weekday) VALUES ($1,'open',8)",
      [orgA],
      "23514",
    );
    await rejects(
      "INSERT INTO opening_rule (organization_id, rule_kind) VALUES ($1,'open')",
      [orgA],
      "23514",
    );
    await rejects(
      "INSERT INTO opening_rule (organization_id, rule_kind, date_from, date_to) VALUES ($1,'closed','2030-02-02','2030-02-01')",
      [orgA],
      "23514",
    );
  });

  it("gece yarısını aşan seans (22:00 + 6 saat) saklanır; benzersizlik ihlali reddedilir", async () => {
    await c.query(
      "INSERT INTO session_template (organization_id,space_id,name,start_local,duration_minutes) VALUES ($1,$2,'gece','22:00',360)",
      [orgA, spaceA],
    );
    await rejects(
      "INSERT INTO venue_space (organization_id,name,slug) VALUES ($1,'y','s-a')",
      [orgA],
      "23505",
    );
  });

  it("updated_at güncellemede ilerler", async () => {
    const before = await c.query(
      "SELECT updated_at FROM resource WHERE id=$1",
      [resourceA],
    );
    await c.query("SELECT pg_sleep(0.02)");
    await c.query("UPDATE resource SET name='R2' WHERE id=$1", [resourceA]);
    const after = await c.query("SELECT updated_at FROM resource WHERE id=$1", [
      resourceA,
    ]);
    expect(after.rows[0].updated_at.getTime()).toBeGreaterThan(
      before.rows[0].updated_at.getTime(),
    );
  });
});
