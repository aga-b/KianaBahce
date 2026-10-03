import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("ActorContext istemciden kurulamaz (tip seviyesi)", () => {
  it("düz nesneyi ActorContext'e atamak derleme hatasıdır", () => {
    let out = "";
    try {
      execFileSync(
        "node_modules/.bin/tsc",
        [
          "--noEmit",
          "--strict",
          "--skipLibCheck",
          "--module",
          "nodenext",
          "--moduleResolution",
          "nodenext",
          "--allowImportingTsExtensions",
          "--target",
          "es2022",
          "--types",
          "node",
          "tests/security/fixtures/forge-actor.ts",
        ],
        { encoding: "utf8", stdio: "pipe" },
      );
    } catch (e) {
      out = String((e as { stdout?: string }).stdout ?? "");
    }
    expect(out).toMatch(
      /forge-actor\.ts\(\d+,\d+\): error TS2741.*__serverIssued/,
    );
  });
});
