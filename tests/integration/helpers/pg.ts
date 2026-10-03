import pg from "pg";

export const DEFAULT_TEST_DATABASE_URL =
  "postgres://kiana:kiana_dev@127.0.0.1:5433/kiana_test";

export function testDatabaseUrl(): string {
  return process.env.TEST_DATABASE_URL || DEFAULT_TEST_DATABASE_URL;
}

export async function withClient<T>(
  fn: (client: pg.Client) => Promise<T>,
): Promise<T> {
  const client = new pg.Client({ connectionString: testDatabaseUrl() });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}
