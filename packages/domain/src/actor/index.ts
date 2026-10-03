import type { ActorKind } from "../identity/index.js";

export type AuthStage = "primary" | "mfa_verified";

/**
 * Yalnız sunucu üretir (`issueActorContext`). `__serverIssued` alanı nedeniyle istemciden gelen header/body
 * nesnesi tip seviyesinde ActorContext olarak kurulamaz; sunucu dışında yapıcı yoktur.
 */
export interface ActorContext {
  readonly __serverIssued: true;
  readonly kind: Exclude<ActorKind, "system">;
  readonly userId: string;
  readonly organizationId: string;
  readonly permissions: readonly string[];
  readonly authStage: AuthStage;
  readonly correlationId: string;
}

export type ActorContextInput = Omit<ActorContext, "__serverIssued">;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PERMISSION = /^[a-z]+(\.[a-z_]+)+$/;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function issueActorContext(input: ActorContextInput): ActorContext {
  if (input.kind !== "customer" && input.kind !== "staff") {
    throw new Error(
      "ActorContext kind must be customer or staff; use a system scope for system work",
    );
  }
  if (!isUuid(input.userId))
    throw new Error("ActorContext userId must be a uuid");
  if (!isUuid(input.organizationId))
    throw new Error("ActorContext organizationId must be a uuid");
  if (
    typeof input.correlationId !== "string" ||
    input.correlationId.length === 0 ||
    input.correlationId.length > 128
  ) {
    throw new Error("ActorContext correlationId is required");
  }
  for (const p of input.permissions) {
    if (!PERMISSION.test(p)) throw new Error(`Invalid permission string: ${p}`);
  }
  return Object.freeze({
    __serverIssued: true as const,
    kind: input.kind,
    userId: input.userId,
    organizationId: input.organizationId,
    permissions: Object.freeze([...input.permissions]),
    authStage: input.authStage,
    correlationId: input.correlationId,
  });
}

/** Sistem aktörü dar kapsamlıdır: işletme, eylem ve hedef kayıt zorunludur. */
export interface SystemScope {
  readonly organizationId: string;
  readonly action: string;
  readonly target: { readonly type: string; readonly id: string };
  readonly correlationId?: string;
}

const ACTION = /^[a-z]+(\.[a-z_]+)+$/;
const TARGET_TYPE = /^[a-z][a-z_]*$/;

export function assertSystemScope(scope: SystemScope): void {
  if (!isUuid(scope.organizationId))
    throw new Error("System scope requires organizationId (uuid)");
  if (!ACTION.test(scope.action ?? ""))
    throw new Error("System scope requires action like 'outbox.dispatch'");
  if (!TARGET_TYPE.test(scope.target?.type ?? ""))
    throw new Error("System scope requires target.type");
  if (!isUuid(scope.target?.id))
    throw new Error("System scope requires target.id (uuid)");
}
