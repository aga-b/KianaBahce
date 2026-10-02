import { test } from "node:test";
import assert from "node:assert/strict";
import { EnvValidationError, parseEnv } from "./index.ts";

const fails = (env: Record<string, string | undefined>, needle: string) =>
  assert.throws(
    () => parseEnv(env),
    (e) => e instanceof EnvValidationError && e.message.includes(needle),
  );

test("missing APP_ENV is rejected", () => fails({}, "APP_ENV"));

test("unknown environment is rejected", () =>
  fails({ APP_ENV: "prod" }, "APP_ENV"));

test("development defaults to fake providers and noindex", () => {
  const env = parseEnv({ APP_ENV: "development" });
  assert.equal(env.fakeProvidersEnabled, true);
  assert.equal(env.siteIndexable, false);
});

test("staging and production default to real providers", () => {
  for (const APP_ENV of ["staging", "production"])
    assert.equal(parseEnv({ APP_ENV }).fakeProvidersEnabled, false);
});

test("fake providers are refused in staging and production", () => {
  for (const APP_ENV of ["staging", "production"])
    fails(
      { APP_ENV, FAKE_PROVIDERS_ENABLED: "true" },
      "FAKE_PROVIDERS_ENABLED",
    );
});

test("indexing is refused outside production", () => {
  for (const APP_ENV of ["development", "test", "staging"])
    fails({ APP_ENV, SITE_INDEXABLE: "true" }, "SITE_INDEXABLE");
  assert.equal(
    parseEnv({ APP_ENV: "production", SITE_INDEXABLE: "true" }).siteIndexable,
    true,
  );
});

test("invalid flag and URL values are rejected", () => {
  fails({ APP_ENV: "test", FAKE_PROVIDERS_ENABLED: "yes" }, "FAKE_PROVIDERS_ENABLED");
  fails({ APP_ENV: "test", SITE_URL: "not a url" }, "SITE_URL");
});

test("blank optional values count as unset", () => {
  const env = parseEnv({ APP_ENV: "test", SITE_URL: "", SITE_INDEXABLE: "" });
  assert.equal(env.siteUrl, undefined);
  assert.equal(env.siteIndexable, false);
});

test("error messages never echo values", () => {
  assert.throws(
    () => parseEnv({ APP_ENV: "test", SITE_URL: "super-secret-value" }),
    (e) => e instanceof Error && !e.message.includes("super-secret-value"),
  );
});
