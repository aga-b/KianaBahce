export type RuntimeEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

export type ProviderCapabilities = {
  /** Provider deduplicates requests carrying the same idempotency key. */
  idempotencyKey: boolean;
  /** Provider can be asked for the state of a previously submitted message. */
  statusQuery: boolean;
  /** Provider reports delivery via webhook or status query. */
  deliveryReports: boolean;
};

/**
 * Outcome of a send attempt. A timeout or unparseable response is `unknown`,
 * never `rejected`: the provider may still have accepted the message (NOT-02),
 * so callers must reconcile by status query instead of blindly retrying.
 */
export type SendResult =
  | { kind: "accepted"; providerMessageId: string }
  | { kind: "rejected"; permanent: boolean; reason: string }
  | { kind: "unknown"; reason: string };

export type DeliveryState =
  | "accepted"
  | "delivered"
  | "failed"
  | "unknown";

export type DeliveryEvent = {
  providerMessageId: string;
  state: DeliveryState;
  occurredAt: Date;
};

export type LookupResult =
  | { kind: "found"; state: DeliveryState }
  | { kind: "not_found" }
  | { kind: "unsupported" };

export type WebhookRequest = {
  headers: Record<string, string | undefined>;
  /** Exact bytes received; signatures are computed over the raw body. */
  rawBody: string;
};

export type WebhookVerification =
  | { valid: true; events: DeliveryEvent[] }
  | { valid: false; reason: string };
