import type { EmailMessage, EmailProvider } from "../ports/email.ts";
import type {
  ProviderCapabilities,
  SendResult,
  WebhookRequest,
  WebhookVerification,
} from "../ports/types.ts";
import { verifyFakeWebhook } from "./webhook.ts";

export class FakeEmailProvider implements EmailProvider {
  readonly capabilities: ProviderCapabilities = {
    idempotencyKey: true,
    statusQuery: false,
    deliveryReports: true,
  };
  readonly sent: Array<EmailMessage & { providerMessageId: string }> = [];
  private readonly byKey = new Map<string, string>();
  private nextResults: SendResult[] = [];

  scriptNext(result: SendResult): void {
    this.nextResults.push(result);
  }

  async send(message: EmailMessage): Promise<SendResult> {
    const scripted = this.nextResults.shift();
    if (scripted) return scripted;
    const existing = this.byKey.get(message.idempotencyKey);
    if (existing) return { kind: "accepted", providerMessageId: existing };
    const providerMessageId = `fake-email-${this.sent.length + 1}`;
    this.byKey.set(message.idempotencyKey, providerMessageId);
    this.sent.push({ ...message, providerMessageId });
    return { kind: "accepted", providerMessageId };
  }

  verifyWebhook(request: WebhookRequest): WebhookVerification {
    return verifyFakeWebhook(request);
  }
}
