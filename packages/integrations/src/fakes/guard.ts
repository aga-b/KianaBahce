import type { RuntimeEnvironment } from "../ports/types.ts";

export class FakeProviderNotAllowedError extends Error {
  constructor(environment: string) {
    super(`Fake providers cannot be loaded when APP_ENV is ${environment}`);
    this.name = "FakeProviderNotAllowedError";
  }
}

export function assertFakeProvidersAllowed(
  environment: RuntimeEnvironment,
): void {
  if (environment !== "development" && environment !== "test") {
    throw new FakeProviderNotAllowedError(environment);
  }
}
