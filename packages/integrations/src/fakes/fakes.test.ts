import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FAKE_SIGNATURE_HEADER,
  FakeProviderNotAllowedError,
  createFakeProviders,
  signFakeWebhook,
} from "./index.ts";

test("fake providers load in development and test", () => {
  for (const env of ["development", "test"] as const)
    assert.ok(createFakeProviders(env).sms);
});

test("fake providers refuse to load in staging and production", () => {
  for (const env of ["staging", "production"] as const)
    assert.throws(
      () => createFakeProviders(env),
      (e) => e instanceof FakeProviderNotAllowedError,
    );
});

test("fake SMS records messages and deduplicates by idempotency key", async () => {
  const { sms } = createFakeProviders("test");
  const msg = { to: "+900000000000", body: "kod 123", idempotencyKey: "k1" };
  const a = await sms.send(msg);
  const b = await sms.send(msg);
  assert.deepEqual(a, b);
  assert.equal(sms.sent.length, 1);
  assert.deepEqual(await sms.lookup("fake-sms-1"), {
    kind: "found",
    state: "accepted",
  });
});

test("an unknown SMS outcome can be reconciled by lookup instead of retried", async () => {
  const { sms } = createFakeProviders("test");
  sms.scriptNext({ kind: "unknown", reason: "timeout" });
  const result = await sms.send({
    to: "+900000000000",
    body: "x",
    idempotencyKey: "k2",
  });
  assert.equal(result.kind, "unknown");
  assert.equal(sms.sent.length, 1);
  assert.equal((await sms.lookup(sms.sent[0]!.providerMessageId)).kind, "found");
});

test("fake email records messages and scripts failures", async () => {
  const { email } = createFakeProviders("test");
  email.scriptNext({ kind: "rejected", permanent: true, reason: "bounce" });
  const first = await email.send({
    to: "a@example.test",
    subject: "s",
    text: "t",
    idempotencyKey: "e1",
  });
  assert.equal(first.kind, "rejected");
  const second = await email.send({
    to: "a@example.test",
    subject: "s",
    text: "t",
    idempotencyKey: "e1",
  });
  assert.equal(second.kind, "accepted");
  assert.equal(email.sent.length, 1);
});

test("webhook verification accepts valid and rejects forged requests", () => {
  const { sms } = createFakeProviders("test");
  const rawBody = JSON.stringify([
    {
      providerMessageId: "fake-sms-1",
      state: "delivered",
      occurredAt: "2026-10-02T10:00:00Z",
    },
  ]);
  const ok = sms.verifyWebhook({
    headers: { [FAKE_SIGNATURE_HEADER]: signFakeWebhook(rawBody) },
    rawBody,
  });
  assert.equal(ok.valid, true);
  assert.equal(
    sms.verifyWebhook({ headers: { [FAKE_SIGNATURE_HEADER]: "00" }, rawBody })
      .valid,
    false,
  );
  assert.equal(sms.verifyWebhook({ headers: {}, rawBody }).valid, false);
  const tampered = rawBody.replace("delivered", "failed");
  assert.equal(
    sms.verifyWebhook({
      headers: { [FAKE_SIGNATURE_HEADER]: signFakeWebhook(rawBody) },
      rawBody: tampered,
    }).valid,
    false,
  );
});

test("fake assistant is deterministic and records requests", async () => {
  const { assistant } = createFakeProviders("test");
  const req = {
    system: "s",
    messages: [{ role: "user" as const, content: "merhaba" }],
    maxOutputTokens: 100,
    timeoutMs: 1000,
  };
  const a = await assistant.generate(req);
  const b = await assistant.generate(req);
  assert.deepEqual(a, b);
  assert.equal(assistant.requests.length, 2);
});
