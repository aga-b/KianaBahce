import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  DeliveryEvent,
  DeliveryState,
  WebhookRequest,
  WebhookVerification,
} from "../ports/types.ts";

// Not a secret: fakes only exist in development/test.
const FAKE_WEBHOOK_KEY = "fake-webhook-key";
export const FAKE_SIGNATURE_HEADER = "x-fake-signature";

export function signFakeWebhook(rawBody: string): string {
  return createHmac("sha256", FAKE_WEBHOOK_KEY).update(rawBody).digest("hex");
}

const STATES: DeliveryState[] = ["accepted", "delivered", "failed", "unknown"];

export function verifyFakeWebhook(request: WebhookRequest): WebhookVerification {
  const given = request.headers[FAKE_SIGNATURE_HEADER];
  if (!given) return { valid: false, reason: "missing signature" };
  const expected = Buffer.from(signFakeWebhook(request.rawBody));
  const actual = Buffer.from(given);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { valid: false, reason: "bad signature" };
  }
  try {
    const parsed: unknown = JSON.parse(request.rawBody);
    if (!Array.isArray(parsed)) return { valid: false, reason: "bad payload" };
    const events: DeliveryEvent[] = parsed.map((item) => {
      const { providerMessageId, state, occurredAt } = item as Record<
        string,
        unknown
      >;
      if (
        typeof providerMessageId !== "string" ||
        !STATES.includes(state as DeliveryState) ||
        typeof occurredAt !== "string" ||
        Number.isNaN(Date.parse(occurredAt))
      ) {
        throw new Error("bad event");
      }
      return {
        providerMessageId,
        state: state as DeliveryState,
        occurredAt: new Date(occurredAt),
      };
    });
    return { valid: true, events };
  } catch {
    return { valid: false, reason: "bad payload" };
  }
}
