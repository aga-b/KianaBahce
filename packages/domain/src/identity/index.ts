export const ACTOR_KINDS = ["customer", "staff", "system"] as const;
export type ActorKind = (typeof ACTOR_KINDS)[number];

/** Aktör referansı her zaman türüyle birlikte taşınır; farklı türlerde eşit ID aynı kişi değildir (§8.1). */
export type ActorRef = { readonly kind: ActorKind; readonly id: string };

export const PERMISSIONS = [
  "booking.confirm",
  "notification.sms.send",
  "publication.publish",
  "finance.record",
  "member.invite",
  "export.private",
  "staff.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const STAFF_ROLE_KEYS = [
  "business_owner",
  "business_manager",
  "reservation_clerk",
  "finance_officer",
  "content_editor",
  "coordinator",
] as const;
export type StaffRoleKey = (typeof STAFF_ROLE_KEYS)[number];

export type CustomerUser = {
  readonly id: string;
  readonly organizationId: string;
  readonly displayName: string | null;
  readonly phoneE164: string | null;
  readonly status: "active" | "locked" | "deleted";
};

export type StaffUser = {
  readonly id: string;
  readonly organizationId: string;
  readonly displayName: string | null;
  readonly status: "invited" | "active" | "locked" | "deleted";
};

export type StaffMembership = {
  readonly id: string;
  readonly organizationId: string;
  readonly staffUserId: string;
  readonly roleKey: StaffRoleKey;
  readonly extraPermissions: readonly Permission[];
  readonly status: "active" | "suspended" | "revoked";
};

/** Etkin izinler: rol paketi + üyeliğe ek verilenler. Yalnız aktif üyelik izin taşır. */
export function effectivePermissions(
  rolePermissions: readonly Permission[],
  membership: Pick<StaffMembership, "extraPermissions" | "status">,
): ReadonlySet<Permission> {
  if (membership.status !== "active") return new Set();
  return new Set([...rolePermissions, ...membership.extraPermissions]);
}
