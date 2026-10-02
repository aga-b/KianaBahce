import { describe, expect, it } from "vitest";
import { withClient } from "./helpers.ts";

describe("gerçek PostgreSQL (SQLite/mock yok)", () => {
  it("PostgreSQL 17+ sunucusuna bağlanır", async () => {
    const version = await withClient(async (c) => {
      const r = await c.query("SHOW server_version_num");
      return Number(r.rows[0].server_version_num);
    });
    expect(version).toBeGreaterThanOrEqual(170000);
  });

  it("GiST exclusion constraint ile çakışan aralığı reddeder (23P01)", async () => {
    await withClient(async (c) => {
      await c.query("CREATE EXTENSION IF NOT EXISTS btree_gist");
      await c.query("BEGIN");
      try {
        await c.query(
          `CREATE TEMP TABLE alloc (
             resource_id int NOT NULL,
             during tstzrange NOT NULL,
             EXCLUDE USING gist (resource_id WITH =, during WITH &&)
           )`,
        );
        await c.query(
          "INSERT INTO alloc VALUES (1, '[2030-01-01,2030-01-03)')",
        );
        await expect(
          c.query("INSERT INTO alloc VALUES (1, '[2030-01-02,2030-01-04)')"),
        ).rejects.toMatchObject({ code: "23P01" });
      } finally {
        await c.query("ROLLBACK");
      }
    });
  });
});
