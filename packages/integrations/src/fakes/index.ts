import type { RuntimeEnvironment } from "../ports/types.ts";
import { FakeAssistantProvider } from "./assistant.ts";
import { FakeEmailProvider } from "./email.ts";
import { assertFakeProvidersAllowed } from "./guard.ts";
import { FakeSmsProvider } from "./sms.ts";

export { FakeAssistantProvider, FakeEmailProvider, FakeSmsProvider };
export { FakeProviderNotAllowedError, assertFakeProvidersAllowed } from "./guard.ts";
export { FAKE_SIGNATURE_HEADER, signFakeWebhook } from "./webhook.ts";

/** Throws unless APP_ENV is development or test. */
export function createFakeProviders(environment: RuntimeEnvironment) {
  assertFakeProvidersAllowed(environment);
  return {
    sms: new FakeSmsProvider(),
    email: new FakeEmailProvider(),
    assistant: new FakeAssistantProvider(),
  };
}
