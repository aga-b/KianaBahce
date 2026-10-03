import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  date,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// Kaynak doğruluk: packages/db/migrations/*_core_schema.sql. Bu dosya tipli sorgular içindir; push kullanılmaz.
const stamps = {
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const organization = pgTable("organization", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Europe/Istanbul"),
  defaultCurrency: char("default_currency", { length: 3 })
    .notNull()
    .default("TRY"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  settingsVersion: integer("settings_version").notNull().default(1),
  ...stamps,
});

export const venueSpace = pgTable(
  "venue_space",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    capacityMax: integer("capacity_max"),
    isActive: boolean("is_active").notNull().default(true),
    ...stamps,
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    unique().on(t.organizationId, t.slug),
  ],
);

export const resource = pgTable(
  "resource",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id),
    kind: text("kind", {
      enum: ["physical_space", "staff", "visit_space"],
    }).notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...stamps,
  },
  (t) => [unique().on(t.organizationId, t.id)],
);

export const spaceResource = pgTable(
  "space_resource",
  {
    organizationId: uuid("organization_id").notNull(),
    spaceId: uuid("space_id").notNull(),
    resourceId: uuid("resource_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.spaceId, t.resourceId] }),
    foreignKey({
      columns: [t.organizationId, t.spaceId],
      foreignColumns: [venueSpace.organizationId, venueSpace.id],
    }),
    foreignKey({
      columns: [t.organizationId, t.resourceId],
      foreignColumns: [resource.organizationId, resource.id],
    }),
  ],
);

export const sessionTemplate = pgTable(
  "session_template",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id),
    spaceId: uuid("space_id").notNull(),
    name: text("name").notNull(),
    startLocal: time("start_local").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    setupBufferMinutes: integer("setup_buffer_minutes").notNull().default(0),
    teardownBufferMinutes: integer("teardown_buffer_minutes")
      .notNull()
      .default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...stamps,
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    foreignKey({
      columns: [t.organizationId, t.spaceId],
      foreignColumns: [venueSpace.organizationId, venueSpace.id],
    }),
  ],
);

export const openingRule = pgTable(
  "opening_rule",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organization.id),
    spaceId: uuid("space_id"),
    sessionTemplateId: uuid("session_template_id"),
    ruleKind: text("rule_kind", { enum: ["open", "closed"] }).notNull(),
    weekday: smallint("weekday"),
    dateFrom: date("date_from"),
    dateTo: date("date_to"),
    note: text("note"),
    ...stamps,
  },
  (t) => [
    unique().on(t.organizationId, t.id),
    foreignKey({
      columns: [t.organizationId, t.spaceId],
      foreignColumns: [venueSpace.organizationId, venueSpace.id],
    }),
    foreignKey({
      columns: [t.organizationId, t.sessionTemplateId],
      foreignColumns: [sessionTemplate.organizationId, sessionTemplate.id],
    }),
    check(
      "opening_rule_has_scope",
      sql`${t.weekday} IS NOT NULL OR ${t.dateFrom} IS NOT NULL`,
    ),
  ],
);
