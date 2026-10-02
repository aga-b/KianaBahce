import { describe, expect, it } from "vitest";
import {
  EnvValidationError,
  parseEnv,
} from "../../packages/contracts/src/index.ts";

describe("ortam koruması (OPS-01)", () => {
  it("production'da sahte sağlayıcılar açık olamaz", () => {
    expect(() =>
      parseEnv({ APP_ENV: "production", FAKE_PROVIDERS_ENABLED: "true" }),
    ).toThrow(EnvValidationError);
  });

  it("hata mesajı geçersiz değeri sızdırmaz", () => {
    const sentinel = "sentinel-deger-xyz";
    try {
      parseEnv({ APP_ENV: "production", SITE_INDEXABLE: sentinel });
      expect.unreachable("geçersiz ortam kabul edilmemeli");
    } catch (e) {
      expect(e).toBeInstanceOf(EnvValidationError);
      expect((e as Error).message).not.toContain(sentinel);
    }
  });
});
