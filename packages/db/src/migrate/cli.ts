import { fileURLToPath } from "node:url";
import { migrate } from "./runner.ts";

const url = process.env.MIGRATION_DATABASE_URL;
if (!url) {
  console.error(
    "MIGRATION_DATABASE_URL is required (migrator credentials, never the runtime URL).",
  );
  process.exit(1);
}
const dir =
  process.env.MIGRATIONS_DIR ??
  fileURLToPath(new URL("../../migrations", import.meta.url));
const result = await migrate({ connectionString: url, dir });
console.log(
  JSON.stringify({
    event: "migrated",
    applied: result.applied,
    skipped: result.skipped.length,
  }),
);
