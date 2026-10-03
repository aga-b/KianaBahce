export const EVENT_TYPES = ["wedding"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_MEMBER_ROLES = ["couple_member", "close_helper"] as const;
export type EventMemberRole = (typeof EVENT_MEMBER_ROLES)[number];

export const EVENT_PERMISSIONS = [
  "plan.view",
  "board.view",
  "board.edit",
  "chat.participate",
  "documents.view",
  "payments.view",
  "member.invite",
] as const;
export type EventPermission = (typeof EVENT_PERMISSIONS)[number];

/** Yakın/yardımcı rolü ilk sürümde kapalı bayrakla durur; şema destekler. */
export const CLOSE_HELPER_ENABLED = false;

export type EventStatus = "active" | "completed" | "cancelled";
export type EventWriteState = "open" | "closed";

export type EventState = {
  readonly status: EventStatus;
  readonly writeState: EventWriteState;
};

export type EventMemberState = {
  readonly role: EventMemberRole;
  readonly status: "active" | "revoked";
  readonly permissions: readonly EventPermission[];
};

const COUPLE_DEFAULTS: readonly EventPermission[] = [
  "plan.view",
  "board.view",
  "board.edit",
  "chat.participate",
  "documents.view",
  "payments.view",
  "member.invite",
];
const CLOSE_HELPER_DEFAULTS: readonly EventPermission[] = [
  "plan.view",
  "board.view",
];

/** Varsayılan izin seti; yakın rolünde belge, ödeme ve özel sohbet yoktur (§7.2). */
export function defaultEventPermissions(
  role: EventMemberRole,
): readonly EventPermission[] {
  return role === "couple_member" ? COUPLE_DEFAULTS : CLOSE_HELPER_DEFAULTS;
}

export function isRoleAssignable(
  role: EventMemberRole,
  closeHelperEnabled = CLOSE_HELPER_ENABLED,
): boolean {
  return role === "couple_member" || closeHelperEnabled;
}

const WRITE_PERMISSIONS: ReadonlySet<EventPermission> = new Set([
  "board.edit",
  "chat.participate",
  "member.invite",
]);

/** Aktif üye, açık izne sahipse yapabilir; kapalı etkinlikte yazma izinleri reddedilir. */
export function canEventMember(
  member: EventMemberState,
  permission: EventPermission,
  event: EventState,
): boolean {
  if (member.status !== "active") return false;
  if (!member.permissions.includes(permission)) return false;
  if (WRITE_PERMISSIONS.has(permission) && event.writeState === "closed")
    return false;
  return true;
}

export type InvitationState = {
  readonly expiresAt: Date;
  readonly consumedAt: Date | null;
  readonly failedAttempts: number;
};

export const MAX_INVITATION_ATTEMPTS = 5;

export function isInvitationUsable(
  inv: InvitationState,
  now: Date,
  maxAttempts = MAX_INVITATION_ATTEMPTS,
): boolean {
  return (
    inv.consumedAt === null &&
    inv.expiresAt.getTime() > now.getTime() &&
    inv.failedAttempts < maxAttempts
  );
}
