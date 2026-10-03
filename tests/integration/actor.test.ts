import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import {
  ActorTx,
  MissingActorContextError,
  execute,
  selectMany,
  selectOne,
  withActor,
  withSystemActor,
} from "../../packages/db/src/index.ts";
import { issueActorContext } from "../../packages/domain/src/actor/index.ts";
import { InMemoryAuditSink } from "../../packages/application/src/ports/index.ts";
import { createTestDb, type TestDb } from "./helpers/db.ts";

let tdb: TestDb;
let pool: pg.Pool;
const ORG_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ORG_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const USER_A = "11111111-1111-4111-8111-111111111111";
const USER_B = "22222222-2222-4222-8222-222222222222";

const ctx = (
  userId: string,
  organizationId: string,
  kind: "customer" | "staff" = "staff",
) =>
  issueActorContext({
    kind,
    userId,
    organizationId,
    permissions: ["booking.confirm"],
    authStage: "mfa_verified",
    correlationId: `corr-${userId.slice(0, 4)}`,
  });

const setting = (tx: ActorTx, key: string) =>
  selectOne(
    tx,
    "SELECT current_setting($1, true) AS v",
    [key],
    (r) => r.v as string | null,
  );

beforeAll(async () => {
  tdb = await createTestDb();
  // Tek bağlantılı havuz: bağlam sızıntısı varsa ikinci aktörde kesin görünür.
  pool = new pg.Pool({ connectionString: tdb.url("kiana_app"), max: 1 });
});
afterAll(async () => {
  await pool?.end();
  await tdb?.drop();
});

describe("withActor (K02-05)", () => {
  it("transaction-local bağlamı kurar", async () => {
    await withActor(pool, ctx(USER_A, ORG_A), async (tx) => {
      expect(await setting(tx, "kiana.actor_kind")).toBe("staff");
      expect(await setting(tx, "kiana.actor_id")).toBe(USER_A);
      expect(await setting(tx, "kiana.organization_id")).toBe(ORG_A);
      expect(await setting(tx, "kiana.permissions")).toBe("booking.confirm");
      expect(await setting(tx, "kiana.correlation_id")).toBe("corr-1111");
    });
  });

  it("art arda iki aktörde aynı bağlantı kullanılır ama ilkinin bağlamı taşınmaz", async () => {
    let pidA = 0;
    let pidB = 0;
    await withActor(pool, ctx(USER_A, ORG_A), async (tx) => {
      pidA = (await selectOne(
        tx,
        "SELECT pg_backend_pid() AS p",
        [],
        (r) => r.p as number,
      ))!;
    });
    await withActor(pool, ctx(USER_B, ORG_B, "customer"), async (tx) => {
      pidB = (await selectOne(
        tx,
        "SELECT pg_backend_pid() AS p",
        [],
        (r) => r.p as number,
      ))!;
      expect(await setting(tx, "kiana.actor_id")).toBe(USER_B);
      expect(await setting(tx, "kiana.organization_id")).toBe(ORG_B);
      expect(await setting(tx, "kiana.actor_kind")).toBe("customer");
    });
    expect(pidA).toBe(pidB);
    const raw = await pool.query(
      "SELECT current_setting('kiana.actor_id', true) AS v",
    );
    expect(raw.rows[0].v === null || raw.rows[0].v === "").toBe(true);
  });

  it("hata durumunda geri alır ve bağlamı sızdırmaz", async () => {
    await expect(
      withActor(pool, ctx(USER_A, ORG_A), async (tx) => {
        await execute(tx, "CREATE TEMP TABLE tmp_x (a int)", []);
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    const raw = await pool.query(
      "SELECT to_regclass('pg_temp.tmp_x') AS t, current_setting('kiana.actor_id', true) AS v",
    );
    expect(raw.rows[0].t).toBeNull();
    expect(raw.rows[0].v === null || raw.rows[0].v === "").toBe(true);
  });

  it("bağlamsız DAL çağrısı reddedilir (ham client, sahte nesne, kapanmış işlem)", async () => {
    const client = await pool.connect();
    try {
      await expect(
        selectMany(client as never, "SELECT 1 AS a", [], (r) => r),
      ).rejects.toBeInstanceOf(MissingActorContextError);
    } finally {
      client.release();
    }
    await expect(
      selectMany({} as never, "SELECT 1 AS a", [], (r) => r),
    ).rejects.toBeInstanceOf(MissingActorContextError);
    let leaked!: ActorTx;
    await withActor(pool, ctx(USER_A, ORG_A), async (tx) => {
      leaked = tx;
    });
    await expect(
      selectMany(leaked, "SELECT 1 AS a", [], (r) => r),
    ).rejects.toBeInstanceOf(MissingActorContextError);
  });

  it("sunucu üretmemiş / geçersiz bağlam reddedilir", () => {
    const forged = {
      kind: "staff",
      userId: USER_A,
      organizationId: ORG_A,
      permissions: [],
      authStage: "mfa_verified",
      correlationId: "x",
    };
    expect(() => withActor(pool, forged as never, async () => 1)).toThrow(
      MissingActorContextError,
    );
    expect(() => withActor(pool, undefined as never, async () => 1)).toThrow(
      MissingActorContextError,
    );
    expect(() =>
      issueActorContext({
        kind: "system" as never,
        userId: USER_A,
        organizationId: ORG_A,
        permissions: [],
        authStage: "primary",
        correlationId: "x",
      }),
    ).toThrow();
    expect(() =>
      issueActorContext({
        kind: "staff",
        userId: "not-a-uuid",
        organizationId: ORG_A,
        permissions: [],
        authStage: "primary",
        correlationId: "x",
      }),
    ).toThrow();
    expect(() =>
      issueActorContext({
        kind: "staff",
        userId: USER_A,
        organizationId: ORG_A,
        permissions: ["a,b"],
        authStage: "primary",
        correlationId: "x",
      }),
    ).toThrow();
  });
});

describe("withSystemActor (K02-05)", () => {
  const scope = {
    organizationId: ORG_A,
    action: "outbox.dispatch",
    target: { type: "outbox_message", id: USER_B },
  };

  it("işletme, eylem ve hedef kapsamıyla system bağlamı kurar", async () => {
    await withSystemActor(pool, scope, async (tx) => {
      expect(await setting(tx, "kiana.actor_kind")).toBe("system");
      expect(await setting(tx, "kiana.organization_id")).toBe(ORG_A);
      expect(await setting(tx, "kiana.system_action")).toBe("outbox.dispatch");
      expect(await setting(tx, "kiana.system_target_type")).toBe(
        "outbox_message",
      );
      expect(await setting(tx, "kiana.system_target_id")).toBe(USER_B);
    });
    const raw = await pool.query(
      "SELECT current_setting('kiana.system_action', true) AS v",
    );
    expect(raw.rows[0].v === null || raw.rows[0].v === "").toBe(true);
  });

  it("kapsam eksikse reddedilir", () => {
    for (const bad of [
      { ...scope, organizationId: "" },
      { ...scope, action: "" },
      { ...scope, action: "ALL" },
      { ...scope, target: { type: "", id: USER_B } },
      { ...scope, target: { type: "x", id: "*" } },
      undefined,
    ]) {
      expect(() => withSystemActor(pool, bad as never, async () => 1)).toThrow(
        MissingActorContextError,
      );
    }
  });
});

describe("DAL yardımcıları (K02-05)", () => {
  it("parametreli sorgu çalışır; allowlist eşleyici sütunları seçer", async () => {
    await withActor(pool, ctx(USER_A, ORG_A), async (tx) => {
      const rows = await selectMany(
        tx,
        "SELECT $1::int AS a, 'gizli' AS secret",
        [7],
        (r) => ({ a: r.a as number }),
      );
      expect(rows).toEqual([{ a: 7 }]);
    });
  });

  it("SELECT * / RETURNING * / tablo.* ve dizi olmayan değerler reddedilir", async () => {
    await withActor(pool, ctx(USER_A, ORG_A), async (tx) => {
      for (const text of [
        "SELECT * FROM organization",
        "select distinct * from organization",
        "SELECT o.* FROM organization o",
        "INSERT INTO organization (name) VALUES ('x') RETURNING *",
        "SELECT id, * FROM organization",
      ]) {
        await expect(selectMany(tx, text, [], (r) => r)).rejects.toThrow(
          /Wildcard/,
        );
      }
      await expect(
        selectMany(tx, "SELECT 1", "1" as never, (r) => r),
      ).rejects.toThrow(/parameterized/);
      await expect(
        selectMany(
          tx,
          "SELECT count(*) AS n FROM organization",
          [],
          (r) => r.n,
        ),
      ).resolves.toBeDefined();
    });
  });

  it("selectOne birden fazla satırda hata verir", async () => {
    await withActor(pool, ctx(USER_A, ORG_A), async (tx) => {
      await expect(
        selectOne(
          tx,
          "SELECT g AS a FROM generate_series(1,2) g",
          [],
          (r) => r.a,
        ),
      ).rejects.toThrow(/more than one/);
    });
  });
});

describe("InMemoryAuditSink (K02-05)", () => {
  it("girdileri sırayla tutar ve değiştirilemez kopya saklar", async () => {
    const sink = new InMemoryAuditSink();
    const entry = {
      actorKind: "staff" as const,
      actorId: USER_A,
      organizationId: ORG_A,
      action: "booking.confirm",
      targetType: "booking",
      targetId: USER_B,
      correlationId: "c1",
      occurredAt: new Date("2026-10-03T10:00:00Z"),
    };
    await sink.record(entry);
    await sink.record({ ...entry, action: "booking.cancel" });
    expect(sink.entries.map((e) => e.action)).toEqual([
      "booking.confirm",
      "booking.cancel",
    ]);
    expect(Object.isFrozen(sink.entries[0])).toBe(true);
  });
});
