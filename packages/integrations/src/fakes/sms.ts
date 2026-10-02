import type { SmsMessage, SmsProvider } from "../ports/sms.ts";
import type {
  DeliveryState,
  LookupResult,
  ProviderCapabilities,
  SendResult,
  WebhookRequest,
  WebhookVerification,
} from "../ports/types.ts";
import { verifyFakeWebhook } from "./webhook.ts";

export class FakeSmsProvider implements SmsProvider {
  readonly capabilities: ProviderCapabilities = {
    idempotencyKey: true,
    statusQuery: true,
    deliveryReports: true,
  };
  /** Messages the fake accepted, in order; read this in tests. */
  readonly sent: Array<SmsMessage & { providerMessageId: string }> = [];
  private readonly byKey = new Map<string, string>();
  private readonly states = new Map<string, DeliveryState>();
  private nextResults: SendResult[] = [];

  /** Queue a scripted outcome for the next send call. */
  scriptNext(result: SendResult): void {
    this.nextResults.push(result);
  }

  setState(providerMessageId: string, state: DeliveryState): void {
    this.states.set(providerMessageId, state);
  }

  async send(message: SmsMessage): Promise<SendResult> {
    const scripted = this.nextResults.shift();
    if (scripted) {
      // An `unknown` outcome may still have reached the provider; model that
      // so reconciliation by lookup can be tested (NOT-02).
      if (scripted.kind === "unknown") this.record(message);
      return scripted;
    }
    return {
      kind: "accepted",
      providerMessageId: this.record(message),
    };
  }

  async lookup(providerMessageId: string): Promise<LookupResult> {
    const state = this.states.get(providerMessageId);
    return state ? { kind: "found", state } : { kind: "not_found" };
  }

  verifyWebhook(request: WebhookRequest): WebhookVerification {
    return verifyFakeWebhook(request);
  }

  private record(message: SmsMessage): string {
    const existing = this.byKey.get(message.idempotencyKey);
    if (existing) return existing;
    const providerMessageId = `fake-sms-${this.sent.length + 1}`;
    this.byKey.set(message.idempotencyKey, providerMessageId);
    this.states.set(providerMessageId, "accepted");
    this.sent.push({ ...message, providerMessageId });
    return providerMessageId;
  }
}
