import {
  foreignKey,
  index,
  integer,
  customType,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { organization } from "./core.ts";
import { customerUser, staffUser } from "./identity.ts";

// Kaynak doğruluk: packages/db/migrations/*_event_schema.sql.
const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });

const stamps = {
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const event = pgTable(
  "event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id),
    eventType: text("event_type", { enum: ["wedding"] })
      .notNull()
      .default("wedding"),
    title: text("title").notNull(),
    status: text("status", { enum: ["active", "completed", "cancelled"] })
      .notNull()
      .default("active"),
    writeState: text("write_state", { enum: ["open", "closed"] })
      .notNull()
      .default("open"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...stamps,
  },
  (t) => [unique().on(t.organizationId, t.id)],
);

export const eventMember = pgTable(
  "event_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull(),
    eventId: uuid("event_id").notNull(),
    customerUserId: uuid("customer_user_id").notNull(),
    role: text("role", { enum: ["couple_member", "close_helper"] }).notNull(),
    permissions: text("permissions").array().notNull().default([]),
    status: text("status", { enum: ["active", "revoked"] })
      .notNull()
      .default("active"),
    ...stamps,
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.organizationId, t.eventId, t.customerUserId),
    foreignKey({
      columns: [t.organizationId, t.eventId],
      foreignColumns: [event.organizationId, event.id],
    }),
    foreignKey({
      columns: [t.organizationId, t.customerUserId],
      foreignColumns: [customerUser.organizationId, customerUser.id],
    }),
    index("event_member_customer_idx").on(t.organizationId, t.customerUserId),
  ],
);

export const eventInvitation = pgTable(
  "event_invitation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id").notNull(),
    eventId: uuid("event_id").notNull(),
    targetChannel: text("target_channel", {
      enum: ["email", "phone"],
    }).notNull(),
    targetEmail: text("target_email"),
    targetPhoneE164: text("target_phone_e164"),
    role: text("role", { enum: ["couple_member", "close_helper"] }).notNull(),
    permissions: text("permissions").array().notNull().default([]),
    tokenHash: bytea("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    consumedByCustomerUserId: uuid("consumed_by_customer_user_id"),
    failedAttempts: integer("failed_attempts").notNull().default(0),
    createdByStaffUserId: uuid("created_by_staff_user_id"),
    ...stamps,
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.tokenHash),
    foreignKey({
      columns: [t.organizationId, t.eventId],
      foreignColumns: [event.organizationId, event.id],
    }),
    foreignKey({
      columns: [t.organizationId, t.consumedByCustomerUserId],
      foreignColumns: [customerUser.organizationId, customerUser.id],
    }),
    foreignKey({
      columns: [t.organizationId, t.createdByStaffUserId],
      foreignColumns: [staffUser.organizationId, staffUser.id],
    }),
    index("event_invitation_event_idx").on(t.organizationId, t.eventId),
  ],
);
