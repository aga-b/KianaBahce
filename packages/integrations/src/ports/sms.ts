import type {
  LookupResult,
  ProviderCapabilities,
  SendResult,
  WebhookRequest,
  WebhookVerification,
} from "./types.ts";

export type SmsMessage = {
  to: string;
  body: string;
  /** Stable per logical notification; reused on retry and reconciliation. */
  idempotencyKey: string;
};

export interface SmsProvider {
  readonly capabilities: ProviderCapabilities;
  send(message: SmsMessage): Promise<SendResult>;
  lookup(providerMessageId: string): Promise<LookupResult>;
  verifyWebhook(request: WebhookRequest): WebhookVerification;
}
