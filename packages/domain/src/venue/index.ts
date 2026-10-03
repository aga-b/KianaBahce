export type ResourceKind = "physical_space" | "staff" | "visit_space";

export type VenueSpace = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly slug: string;
  readonly capacityMax: number | null;
  readonly isActive: boolean;
  readonly version: number;
};

export type Resource = {
  readonly id: string;
  readonly organizationId: string;
  readonly kind: ResourceKind;
  readonly name: string;
  readonly isActive: boolean;
  readonly version: number;
};

/** Yerel saat başlangıcı + süre; gece yarısını aşabilir. Tamponlar bloke aralığa eklenir (§9.1). */
export type SessionTemplate = {
  readonly id: string;
  readonly organizationId: string;
  readonly spaceId: string;
  readonly name: string;
  readonly startLocal: string;
  readonly durationMinutes: number;
  readonly setupBufferMinutes: number;
  readonly teardownBufferMinutes: number;
  readonly isActive: boolean;
  readonly version: number;
};
