import { z } from "zod";

export const APP_ENVIRONMENTS = [
  "development",
  "test",
  "staging",
  "production",
] as const;
export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

const booleanFlag = z.enum(["true", "false"]).transform((v) => v === "true");

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const rawSchema = z.object({
  APP_ENV: z.enum(APP_ENVIRONMENTS),
  SITE_URL: z.preprocess(blankToUndefined, z.url().optional()),
  SITE_INDEXABLE: z.preprocess(blankToUndefined, booleanFlag.default(false)),
  FAKE_PROVIDERS_ENABLED: z.preprocess(blankToUndefined, booleanFlag.optional()),
});

export type AppEnv = {
  appEnv: AppEnvironment;
  siteUrl: string | undefined;
  siteIndexable: boolean;
  fakeProvidersEnabled: boolean;
};

export class EnvValidationError extends Error {
  readonly issues: string[];
  constructor(issues: string[]) {
    super(`Invalid environment configuration: ${issues.join("; ")}`);
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}

/**
 * Parses and validates process environment. Error messages name variables
 * only and never echo values, so secrets cannot leak into logs.
 */
export function parseEnv(
  source: Record<string, string | undefined>,
): AppEnv {
  const result = rawSchema.safeParse(source);
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map(
        (issue) => `${issue.path.join(".") || "env"}: ${issue.message}`,
      ),
    );
  }
  const { APP_ENV, SITE_URL, SITE_INDEXABLE, FAKE_PROVIDERS_ENABLED } =
    result.data;
  const isLocal = APP_ENV === "development" || APP_ENV === "test";
  const fake = FAKE_PROVIDERS_ENABLED ?? isLocal;
  if (!isLocal && fake) {
    throw new EnvValidationError([
      `FAKE_PROVIDERS_ENABLED: must not be true when APP_ENV is ${APP_ENV}`,
    ]);
  }
  if (APP_ENV !== "production" && SITE_INDEXABLE) {
    throw new EnvValidationError([
      `SITE_INDEXABLE: may only be true when APP_ENV is production`,
    ]);
  }
  return {
    appEnv: APP_ENV,
    siteUrl: SITE_URL,
    siteIndexable: SITE_INDEXABLE,
    fakeProvidersEnabled: fake,
  };
}

export function loadEnv(): AppEnv {
  return parseEnv(process.env);
}
