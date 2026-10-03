import {
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { organization } from "./core.ts";

// Kaynak doğruluk: packages/db/migrations/*_identity_schema.sql. Müşteri ve personel arasında FK yoktur (bilerek).
const stamps = {
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const customerUser = pgTable(
  "customer_user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id),
    displayName: text("display_name"),
    contactEmail: text("contact_email"),
    contactEmailVerifiedAt: timestamp("contact_email_verified_at", {
      withTimezone: true,
    }),
    phoneE164: text("phone_e164"),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    status: text("status", { enum: ["active", "locked", "deleted"] })
      .notNull()
      .default("active"),
    ...stamps,
  },
  (t) => [unique().on(t.organizationId, t.id)],
);

export const staffUser = pgTable(
  "staff_user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id),
    displayName: text("display_name"),
    contactEmail: text("contact_email"),
    status: text("status", { enum: ["invited", "active", "locked", "deleted"] })
      .notNull()
      .default("invited"),
    ...stamps,
  },
  (t) => [unique().on(t.organizationId, t.id)],
);

export const permission = pgTable("permission", {
  key: text("key").primaryKey(),
  description: text("description").notNull(),
});

export const staffRole = pgTable("staff_role", {
  key: text("key").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const staffRolePermission = pgTable(
  "staff_role_permission",
  {
    roleKey: text("role_key")
      .notNull()
      .references(() => staffRole.key),
    permissionKey: text("permission_key")
      .notNull()
      .references(() => permission.key),
  },
  (t) => [primaryKey({ columns: [t.roleKey, t.permissionKey] })],
);

export const staffMembership = pgTable(
  "staff_membership",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull(),
    staffUserId: uuid("staff_user_id").notNull(),
    roleKey: text("role_key")
      .notNull()
      .references(() => staffRole.key),
    status: text("status", { enum: ["active", "suspended", "revoked"] })
      .notNull()
      .default("active"),
    ...stamps,
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.organizationId, t.staffUserId),
    foreignKey({
      columns: [t.organizationId, t.staffUserId],
      foreignColumns: [staffUser.organizationId, staffUser.id],
    }),
  ],
);

export const staffMembershipPermission = pgTable(
  "staff_membership_permission",
  {
    organizationId: uuid("organization_id").notNull(),
    membershipId: uuid("membership_id").notNull(),
    permissionKey: text("permission_key")
      .notNull()
      .references(() => permission.key),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.membershipId, t.permissionKey] }),
    foreignKey({
      columns: [t.organizationId, t.membershipId],
      foreignColumns: [staffMembership.organizationId, staffMembership.id],
    }),
  ],
);

export const staffAssignment = pgTable(
  "staff_assignment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull(),
    membershipId: uuid("membership_id").notNull(),
    eventId: uuid("event_id").notNull(),
    ...stamps,
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.organizationId, t.membershipId, t.eventId),
    foreignKey({
      columns: [t.organizationId, t.membershipId],
      foreignColumns: [staffMembership.organizationId, staffMembership.id],
    }),
    index("staff_assignment_event_idx").on(t.organizationId, t.eventId),
  ],
);
