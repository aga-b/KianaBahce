import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export const DEFAULT_POOL_MAX = 10;
const POOL_MAX_LIMIT = 50;

export function poolMaxFromEnv(
  env: Record<string, string | undefined> = process.env,
): number {
  const raw = env.DB_POOL_MAX?.trim();
  if (!raw) return DEFAULT_POOL_MAX;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > POOL_MAX_LIMIT) {
    throw new Error(
      `DB_POOL_MAX must be an integer between 1 and ${POOL_MAX_LIMIT}`,
    );
  }
  return n;
}

export function createDbClient(options: {
  connectionString: string;
  poolMax?: number;
}) {
  const pool = new pg.Pool({
    connectionString: options.connectionString,
    max: options.poolMax ?? poolMaxFromEnv(),
  });
  return { pool, db: drizzle(pool) };
}

export type DbClient = ReturnType<typeof createDbClient>;
