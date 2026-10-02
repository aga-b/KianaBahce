import type {
  ProviderCapabilities,
  SendResult,
  WebhookRequest,
  WebhookVerification,
} from "./types.ts";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  idempotencyKey: string;
};

export interface EmailProvider {
  readonly capabilities: ProviderCapabilities;
  send(message: EmailMessage): Promise<SendResult>;
  verifyWebhook(request: WebhookRequest): WebhookVerification;
}
