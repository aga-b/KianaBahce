import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { createTestDb, type TestDb } from "./helpers/db.ts";
import {
  PERMISSIONS,
  STAFF_ROLE_KEYS,
  effectivePermissions,
} from "../../packages/domain/src/identity/index.ts";

let tdb: TestDb;
let c: pg.Client;
let orgA: string;
let orgB: string;

async function id(sql: string, params: unknown[]): Promise<string> {
  const r = await c.query(sql, params);
  return r.rows[0].id;
}

beforeAll(async () => {
  tdb = await createTestDb();
  c = new pg.Client({ connectionString: tdb.url("kiana_app") });
  await c.connect();
  orgA = await id(
    "INSERT INTO organization (name) VALUES ('A') RETURNING id",
    [],
  );
  orgB = await id(
    "INSERT INTO organization (name) VALUES ('B') RETURNING id",
    [],
  );
});
afterAll(async () => {
  await c?.end();
  await tdb?.drop();
});

const rejects = (sql: string, params: unknown[], code: string) =>
  expect(c.query(sql, params)).rejects.toMatchObject({ code });

describe("kimlik şeması (K02-03)", () => {
  it("müşteri ve personel tabloları arasında hiçbir FK yoktur", async () => {
    const r = await c.query(`
      SELECT conrelid::regclass::text AS from_t, confrelid::regclass::text AS to_t
      FROM pg_constraint
      WHERE contype = 'f'
        AND ((conrelid = 'customer_user'::regclass AND confrelid <> 'organization'::regclass)
          OR (confrelid = 'customer_user'::regclass)
          OR (conrelid = 'staff_user'::regclass AND confrelid <> 'organization'::regclass)
          OR (confrelid = 'staff_user'::regclass AND conrelid <> 'staff_membership'::regclass))`);
    expect(r.rows).toEqual([]);
  });

  it("aynı e-posta ve telefon müşteri ile personelde ayrı kimlik olarak yaşar", async () => {
    const cu = await id(
      "INSERT INTO customer_user (organization_id, contact_email) VALUES ($1,'ayni@example.com') RETURNING id",
      [orgA],
    );
    const su = await id(
      "INSERT INTO staff_user (organization_id, contact_email) VALUES ($1,'ayni@example.com') RETURNING id",
      [orgA],
    );
    expect(cu).not.toBe(su);
    const cols = await c.query(
      "SELECT 1 FROM information_schema.columns WHERE table_name IN ('customer_user','staff_user') AND column_name IN ('customer_user_id','staff_user_id')",
    );
    expect(cols.rowCount).toBe(0);
  });

  it("auth_customer ve auth_staff ayrı namespace olarak vardır", async () => {
    const r = await c.query(
      "SELECT nspname FROM pg_namespace WHERE nspname IN ('auth_customer','auth_staff') ORDER BY 1",
    );
    expect(r.rows.map((x) => x.nspname)).toEqual([
      "auth_customer",
      "auth_staff",
    ]);
  });

  it("actor_kind yalnız customer|staff|system kabul eder", async () => {
    await c.query(
      "SELECT 'customer'::actor_kind, 'staff'::actor_kind, 'system'::actor_kind",
    );
    await rejects("SELECT 'admin'::actor_kind", [], "23514");
  });

  it("rol→izin eşlemesi veridir; sabit isAdmin sütunu yoktur", async () => {
    const roles = await c.query("SELECT key FROM staff_role ORDER BY key");
    expect(roles.rows.map((r) => r.key).sort()).toEqual(
      [...STAFF_ROLE_KEYS].sort(),
    );
    const perms = await c.query("SELECT key FROM permission ORDER BY key");
    expect(perms.rows.map((r) => r.key).sort()).toEqual(
      [...PERMISSIONS].sort(),
    );
    const owner = await c.query(
      "SELECT count(*)::int AS n FROM staff_role_permission WHERE role_key='business_owner'",
    );
    expect(owner.rows[0].n).toBe(PERMISSIONS.length);
    const admin = await c.query(
      "SELECT 1 FROM information_schema.columns WHERE column_name ~* '^(is_?admin|is_?owner|is_?superuser)$'",
    );
    expect(admin.rowCount).toBe(0);
  });

  it("çalışma zamanı rolü rol/izin verisini değiştiremez", async () => {
    await rejects(
      "INSERT INTO permission (key, description) VALUES ('x.y','z')",
      [],
      "42501",
    );
    await rejects("DELETE FROM staff_role_permission", [], "42501");
  });

  it("üyelik başka organizasyonun personeline bağlanamaz", async () => {
    const su = await id(
      "INSERT INTO staff_user (organization_id) VALUES ($1) RETURNING id",
      [orgA],
    );
    await rejects(
      "INSERT INTO staff_membership (organization_id, staff_user_id, role_key) VALUES ($1,$2,'coordinator')",
      [orgB, su],
      "23503",
    );
    await c.query(
      "INSERT INTO staff_membership (organization_id, staff_user_id, role_key) VALUES ($1,$2,'coordinator')",
      [orgA, su],
    );
    await rejects(
      "INSERT INTO staff_membership (organization_id, staff_user_id, role_key) VALUES ($1,$2,'coordinator')",
      [orgA, su],
      "23505",
    );
  });

  it("ek izin ve atama aynı organizasyonla sınırlıdır; bilinmeyen izin/rol reddedilir", async () => {
    const su = await id(
      "INSERT INTO staff_user (organization_id) VALUES ($1) RETURNING id",
      [orgA],
    );
    const m = await id(
      "INSERT INTO staff_membership (organization_id, staff_user_id, role_key) VALUES ($1,$2,'coordinator') RETURNING id",
      [orgA, su],
    );
    await c.query(
      "INSERT INTO staff_membership_permission (organization_id, membership_id, permission_key) VALUES ($1,$2,'notification.sms.send')",
      [orgA, m],
    );
    await rejects(
      "INSERT INTO staff_membership_permission (organization_id, membership_id, permission_key) VALUES ($1,$2,'yok.izin')",
      [orgA, m],
      "23503",
    );
    await rejects(
      "INSERT INTO staff_membership_permission (organization_id, membership_id, permission_key) VALUES ($1,$2,'finance.record')",
      [orgB, m],
      "23503",
    );
    const ev = "11111111-1111-1111-1111-111111111111";
    await c.query(
      "INSERT INTO staff_assignment (organization_id, membership_id, event_id) VALUES ($1,$2,$3)",
      [orgA, m, ev],
    );
    await rejects(
      "INSERT INTO staff_assignment (organization_id, membership_id, event_id) VALUES ($1,$2,$3)",
      [orgA, m, ev],
      "23505",
    );
    await rejects(
      "INSERT INTO staff_assignment (organization_id, membership_id, event_id) VALUES ($1,$2,$3)",
      [orgB, m, ev],
      "23503",
    );
    const su2 = await id(
      "INSERT INTO staff_user (organization_id) VALUES ($1) RETURNING id",
      [orgA],
    );
    await rejects(
      "INSERT INTO staff_membership (organization_id, staff_user_id, role_key) VALUES ($1,$2,'yok_rol')",
      [orgA, su2],
      "23503",
    );
  });

  it("telefon E.164 biçimini zorlar", async () => {
    await rejects(
      "INSERT INTO customer_user (organization_id, phone_e164) VALUES ($1,'05321234567')",
      [orgA],
      "23514",
    );
  });
});

describe("effectivePermissions (domain)", () => {
  it("rol izinleri + ek izinler; aktif olmayan üyelik izin taşımaz", () => {
    const set = effectivePermissions(["booking.confirm"], {
      extraPermissions: ["notification.sms.send"],
      status: "active",
    });
    expect([...set].sort()).toEqual([
      "booking.confirm",
      "notification.sms.send",
    ]);
    expect(
      effectivePermissions(["booking.confirm"], {
        extraPermissions: [],
        status: "suspended",
      }).size,
    ).toBe(0);
  });
});
