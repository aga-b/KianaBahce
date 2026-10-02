import { test } from "node:test";
import assert from "node:assert/strict";
import {
  todayInIstanbul,
  validatePlan,
} from "../../apps/web/src/site/planning.mjs";
test("Istanbul date changes before UTC midnight", () =>
  assert.equal(
    todayInIstanbul(new Date("2026-10-01T21:30:00Z")),
    "2026-10-02",
  ));
test("rejects missing, impossible and past dates", () => {
  for (const date of ["", "2026-02-30", "2025-01-01"])
    assert.ok(validatePlan(date, "150", "2026-10-02"));
});
test("accepts today without claiming availability", () =>
  assert.equal(validatePlan("2026-10-02", "150", "2026-10-02"), null));
test("requires positive whole guest count", () => {
  for (const count of ["", "0", "-1", "1.5", "NaN", "1e3"])
    assert.ok(validatePlan("2026-10-03", count, "2026-10-02"));
});
