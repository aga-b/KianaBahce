import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { createHash } from "node:crypto";
import { createTestDb, type TestDb } from "./helpers/db.ts";
import {
  canEventMember,
  defaultEventPermissions,
  isInvitationUsable,
  isRoleAssignable,
} from "../../packages/domain/src/event/index.ts";

let tdb: TestDb;
let c: pg.Client;
let orgA: string;
let orgB: string;
let evA: string;
let evB: string;
let custA: string;
let custB: string;

async function id(sql: string, params: unknown[]): Promise<string> {
  const r = await c.query(sql, params);
  return r.rows[0].id;
}
const hash = (s: string) => createHash("sha256").update(s).digest();
const rejects = (sql: string, params: unknown[], code: string) =>
  expect(c.query(sql, params)).rejects.toMatchObject({ code });
const invite = (org: string, ev: string, token: string, extra = "") =>
  c.query(
    `INSERT INTO event_invitation (organization_id, event_id, target_channel, target_email, role, token_hash, expires_at ${extra ? "," + extra.split("|")[0] : ""})
     VALUES ($1,$2,'email','a@example.com','couple_member',$3, now() + interval '48 hours' ${extra ? "," + extra.split("|")[1] : ""})`,
    [org, ev, hash(token)],
  );

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
  evA = await id(
    "INSERT INTO event (organization_id, title) VALUES ($1,'A düğün') RETURNING id",
    [orgA],
  );
  evB = await id(
    "INSERT INTO event (organization_id, title) VALUES ($1,'B düğün') RETURNING id",
    [orgB],
  );
  custA = await id(
    "INSERT INTO customer_user (organization_id) VALUES ($1) RETURNING id",
    [orgA],
  );
  custB = await id(
    "INSERT INTO customer_user (organization_id) VALUES ($1) RETURNING id",
    [orgB],
  );
});
afterAll(async () => {
  await c?.end();
  await tdb?.drop();
});

describe("event şeması (K02-04)", () => {
  it("event_type geçersiz değerde reddedilir; varsayılan wedding", async () => {
    await rejects(
      "INSERT INTO event (organization_id, title, event_type) VALUES ($1,'x','kina')",
      [orgA],
      "23514",
    );
    const r = await c.query("SELECT event_type FROM event WHERE id=$1", [evA]);
    expect(r.rows[0].event_type).toBe("wedding");
  });

  it("iptal edilen etkinlik yazmaya kapanır; tutarsız durum reddedilir", async () => {
    await rejects(
      "INSERT INTO event (organization_id, title, status, cancelled_at) VALUES ($1,'x','cancelled', now())",
      [orgA],
      "23514",
    );
    await rejects(
      "INSERT INTO event (organization_id, title, status) VALUES ($1,'x','cancelled')",
      [orgA],
      "23514",
    );
    await c.query(
      "INSERT INTO event (organization_id, title, status, write_state, cancelled_at) VALUES ($1,'x','cancelled','closed', now())",
      [orgA],
    );
  });

  it("başka işletmenin event'ine üye bağlanamaz; başka işletmenin müşterisi üye olamaz", async () => {
    await rejects(
      "INSERT INTO event_member (organization_id, event_id, customer_user_id, role) VALUES ($1,$2,$3,'couple_member')",
      [orgA, evB, custA],
      "23503",
    );
    await rejects(
      "INSERT INTO event_member (organization_id, event_id, customer_user_id, role) VALUES ($1,$2,$3,'couple_member')",
      [orgA, evA, custB],
      "23503",
    );
    await c.query(
      "INSERT INTO event_member (organization_id, event_id, customer_user_id, role, permissions) VALUES ($1,$2,$3,'close_helper','{plan.view,board.view}')",
      [orgA, evA, custA],
    );
    await rejects(
      "INSERT INTO event_member (organization_id, event_id, customer_user_id, role) VALUES ($1,$2,$3,'couple_member')",
      [orgA, evA, custA],
      "23505",
    );
  });

  it("bilinmeyen rol ve izin reddedilir", async () => {
    const c2 = await id(
      "INSERT INTO customer_user (organization_id) VALUES ($1) RETURNING id",
      [orgA],
    );
    await rejects(
      "INSERT INTO event_member (organization_id, event_id, customer_user_id, role) VALUES ($1,$2,$3,'admin')",
      [orgA, evA, c2],
      "23514",
    );
    await rejects(
      "INSERT INTO event_member (organization_id, event_id, customer_user_id, role, permissions) VALUES ($1,$2,$3,'couple_member','{is_admin}')",
      [orgA, evA, c2],
      "23514",
    );
  });

  it("personel kimliği event üyesi olamaz (member yalnız customer_user'a bağlıdır)", async () => {
    const su = await id(
      "INSERT INTO staff_user (organization_id) VALUES ($1) RETURNING id",
      [orgA],
    );
    await rejects(
      "INSERT INTO event_member (organization_id, event_id, customer_user_id, role) VALUES ($1,$2,$3,'couple_member')",
      [orgA, evA, su],
      "23503",
    );
  });

  it("başka işletmenin event'ine davet bağlanamaz", async () => {
    await rejects(
      `INSERT INTO event_invitation (organization_id, event_id, target_channel, target_email, role, token_hash, expires_at)
       VALUES ($1,$2,'email','a@example.com','couple_member',$3, now() + interval '1 day')`,
      [orgA, evB, hash("t0")],
      "23503",
    );
  });

  it("davet token'ı düz metin saklanamaz: yalnız 32 bayt hash kolonu vardır", async () => {
    const cols = await c.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='event_invitation' AND column_name ~* 'token|secret|code'",
    );
    expect(cols.rows).toEqual([
      { column_name: "token_hash", data_type: "bytea" },
    ]);
    await rejects(
      `INSERT INTO event_invitation (organization_id, event_id, target_channel, target_email, role, token_hash, expires_at)
       VALUES ($1,$2,'email','a@example.com','couple_member',convert_to('düz-metin-token','UTF8'), now() + interval '1 day')`,
      [orgA, evA],
      "23514",
    );
    await invite(orgA, evA, "tek-token");
    await rejects(
      `INSERT INTO event_invitation (organization_id, event_id, target_channel, target_email, role, token_hash, expires_at)
       VALUES ($1,$2,'email','b@example.com','couple_member',$3, now() + interval '1 day')`,
      [orgA, evA, hash("tek-token")],
      "23505",
    );
  });

  it("davet tek hedef kanala bağlanır ve biçimi doğrulanır", async () => {
    const base = `INSERT INTO event_invitation (organization_id, event_id, target_channel, target_email, target_phone_e164, role, token_hash, expires_at)
      VALUES ($1,$2,$3,$4,$5,'couple_member',$6, now() + interval '1 day')`;
    await rejects(
      base,
      [orgA, evA, "email", "a@example.com", "+905321234567", hash("k1")],
      "23514",
    );
    await rejects(base, [orgA, evA, "email", null, null, hash("k2")], "23514");
    await rejects(
      base,
      [orgA, evA, "phone", null, "05321234567", hash("k3")],
      "23514",
    );
    await rejects(
      base,
      [orgA, evA, "email", "BuyukHarf@Example.com", null, hash("k4")],
      "23514",
    );
    await c.query(base, [
      orgA,
      evA,
      "phone",
      null,
      "+905321234567",
      hash("k5"),
    ]);
  });

  it("tüketim kaydı müşteriyle birlikte yazılır; süre ve sayaç kısıtları vardır", async () => {
    await rejects(
      `UPDATE event_invitation SET consumed_at = now() WHERE token_hash = $1`,
      [hash("tek-token")],
      "23514",
    );
    await c.query(
      `UPDATE event_invitation SET consumed_at = now(), consumed_by_customer_user_id = $2 WHERE token_hash = $1`,
      [hash("tek-token"), custA],
    );
    await rejects(
      `UPDATE event_invitation SET failed_attempts = -1 WHERE token_hash = $1`,
      [hash("tek-token")],
      "23514",
    );
    await rejects(
      `UPDATE event_invitation SET consumed_by_customer_user_id = $2 WHERE token_hash = $1`,
      [hash("tek-token"), custB],
      "23503",
    );
  });
});

describe("event domain", () => {
  const active = { status: "active", writeState: "open" } as const;
  const closed = { status: "cancelled", writeState: "closed" } as const;

  it("yakın rolünün varsayılanında belge/ödeme yoktur; rol bayrakla kapalıdır", () => {
    expect(defaultEventPermissions("close_helper")).toEqual([
      "plan.view",
      "board.view",
    ]);
    expect(isRoleAssignable("close_helper")).toBe(false);
    expect(isRoleAssignable("close_helper", true)).toBe(true);
    expect(isRoleAssignable("couple_member")).toBe(true);
  });

  it("açık izin gerekir; kapalı etkinlikte yazma reddedilir, okuma sürer", () => {
    const m = {
      role: "couple_member",
      status: "active",
      permissions: ["plan.view", "board.edit"],
    } as const;
    expect(canEventMember(m, "plan.view", active)).toBe(true);
    expect(canEventMember(m, "payments.view", active)).toBe(false);
    expect(canEventMember(m, "board.edit", active)).toBe(true);
    expect(canEventMember(m, "board.edit", closed)).toBe(false);
    expect(canEventMember(m, "plan.view", closed)).toBe(true);
    expect(
      canEventMember({ ...m, status: "revoked" }, "plan.view", active),
    ).toBe(false);
  });

  it("davet kullanılabilirliği: süre, tüketim ve deneme sınırı", () => {
    const now = new Date("2026-10-03T10:00:00Z");
    const ok = {
      expiresAt: new Date("2026-10-04T10:00:00Z"),
      consumedAt: null,
      failedAttempts: 0,
    };
    expect(isInvitationUsable(ok, now)).toBe(true);
    expect(isInvitationUsable({ ...ok, expiresAt: now }, now)).toBe(false);
    expect(isInvitationUsable({ ...ok, consumedAt: now }, now)).toBe(false);
    expect(isInvitationUsable({ ...ok, failedAttempts: 5 }, now)).toBe(false);
  });
});
