import { randomUUID } from "node:crypto";
import type pg from "pg";

// Yapısal tipler: db paketi domain'e derleme bağımlılığı taşımaz; ActorContext/SystemScope bunları karşılar.
export interface ActorBinding {
  readonly __serverIssued: true;
  readonly kind: "customer" | "staff";
  readonly userId: string;
  readonly organizationId: string;
  readonly permissions: readonly string[];
  readonly authStage: string;
  readonly correlationId: string;
}

export interface SystemScopeBinding {
  readonly organizationId: string;
  readonly action: string;
  readonly target: { readonly type: string; readonly id: string };
  readonly correlationId?: string;
}

export class MissingActorContextError extends Error {
  constructor(
    message = "DAL call requires an active actor context (use withActor / withSystemActor)",
  ) {
    super(message);
    this.name = "MissingActorContextError";
  }
}

/** Yalnız withActor / withSystemActor üretir. İşlem bitince geçersizleşir. */
export class ActorTx {
  #client: pg.PoolClient | null;

  constructor(client: pg.PoolClient) {
    this.#client = client;
  }

  /** @internal DAL yardımcıları kullanır. */
  get client(): pg.PoolClient {
    if (!this.#client)
      throw new MissingActorContextError("Actor transaction is closed");
    return this.#client;
  }

  /** @internal */
  close(): void {
    this.#client = null;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PERMISSION = /^[a-z]+(\.[a-z_]+)+$/;
const ACTION = /^[a-z]+(\.[a-z_]+)+$/;
const TARGET_TYPE = /^[a-z][a-z_]*$/;

function assertUuid(value: unknown, what: string): asserts value is string {
  if (typeof value !== "string" || !UUID.test(value))
    throw new MissingActorContextError(`Invalid ${what}`);
}

async function runScoped<T>(
  pool: pg.Pool,
  settings: Record<string, string>,
  fn: (tx: ActorTx) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  const tx = new ActorTx(client);
  let failed = false;
  try {
    await client.query("BEGIN");
    // set_config(..., true) = SET LOCAL: bağlam transaction ile biter, havuzdaki bağlantıya sızmaz.
    const keys = Object.keys(settings);
    const sql = keys
      .map((_, i) => `set_config($${i * 2 + 1}, $${i * 2 + 2}, true)`)
      .join(", ");
    await client.query(
      `SELECT ${sql}`,
      keys.flatMap((k) => [k, settings[k]]),
    );
    const result = await fn(tx);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    failed = true;
    try {
      await client.query("ROLLBACK");
      failed = false;
    } catch {
      // bağlantı bozuk; havuzdan atılır
    }
    throw err;
  } finally {
    tx.close();
    client.release(failed);
  }
}

export function withActor<T>(
  pool: pg.Pool,
  ctx: ActorBinding,
  fn: (tx: ActorTx) => Promise<T>,
): Promise<T> {
  if (!ctx || ctx.__serverIssued !== true)
    throw new MissingActorContextError("ActorContext is required");
  if (ctx.kind !== "customer" && ctx.kind !== "staff")
    throw new MissingActorContextError("Invalid actor kind");
  assertUuid(ctx.userId, "userId");
  assertUuid(ctx.organizationId, "organizationId");
  if (!ctx.correlationId)
    throw new MissingActorContextError("Invalid correlationId");
  for (const p of ctx.permissions) {
    if (!PERMISSION.test(p))
      throw new MissingActorContextError("Invalid permission string");
  }
  return runScoped(
    pool,
    {
      "kiana.actor_kind": ctx.kind,
      "kiana.actor_id": ctx.userId,
      "kiana.organization_id": ctx.organizationId,
      "kiana.permissions": ctx.permissions.join(","),
      "kiana.auth_stage": ctx.authStage,
      "kiana.correlation_id": ctx.correlationId,
    },
    fn,
  );
}

export function withSystemActor<T>(
  pool: pg.Pool,
  scope: SystemScopeBinding,
  fn: (tx: ActorTx) => Promise<T>,
): Promise<T> {
  if (!scope) throw new MissingActorContextError("System scope is required");
  assertUuid(scope.organizationId, "system scope organizationId");
  if (typeof scope.action !== "string" || !ACTION.test(scope.action)) {
    throw new MissingActorContextError("Invalid system scope action");
  }
  if (!scope.target || !TARGET_TYPE.test(scope.target.type ?? "")) {
    throw new MissingActorContextError("Invalid system scope target type");
  }
  assertUuid(scope.target.id, "system scope target id");
  return runScoped(
    pool,
    {
      "kiana.actor_kind": "system",
      "kiana.actor_id": "",
      "kiana.organization_id": scope.organizationId,
      "kiana.permissions": "",
      "kiana.auth_stage": "",
      "kiana.correlation_id": scope.correlationId ?? randomUUID(),
      "kiana.system_action": scope.action,
      "kiana.system_target_type": scope.target.type,
      "kiana.system_target_id": scope.target.id,
    },
    fn,
  );
}
