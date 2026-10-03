import { ActorTx, MissingActorContextError } from "../actor/with-actor.ts";

export type Row = Record<string, unknown>;

// Sütunlar açıkça yazılır; DTO eşleyicisi allowlist'tir. SELECT * / RETURNING * / tablo.* sonucu dışarı verilmez.
const STAR =
  /\bselect\s+(?:distinct\s+)?\*|\breturning\s+\*|[\w"]+\.\*|,\s*\*\s*(?:from|,|$)/i;

function check(tx: unknown, text: string, values: readonly unknown[]): ActorTx {
  if (!(tx instanceof ActorTx)) throw new MissingActorContextError();
  if (typeof text !== "string" || text.trim() === "")
    throw new Error("SQL text is required");
  if (!Array.isArray(values))
    throw new Error("SQL values must be an array (parameterized queries only)");
  if (STAR.test(text))
    throw new Error(
      "Wildcard column lists are not allowed; list columns and map to a DTO",
    );
  return tx;
}

export async function selectMany<T>(
  tx: ActorTx,
  text: string,
  values: readonly unknown[],
  mapRow: (row: Row) => T,
): Promise<T[]> {
  const t = check(tx, text, values);
  const r = await t.client.query(text, [...values]);
  return r.rows.map((row) => mapRow(row as Row));
}

export async function selectOne<T>(
  tx: ActorTx,
  text: string,
  values: readonly unknown[],
  mapRow: (row: Row) => T,
): Promise<T | null> {
  const rows = await selectMany(tx, text, values, mapRow);
  if (rows.length > 1) throw new Error("selectOne matched more than one row");
  return rows[0] ?? null;
}

/** Sonuç satırı döndürmeyen komutlar (INSERT/UPDATE/DELETE); etkilenen satır sayısını verir. */
export async function execute(
  tx: ActorTx,
  text: string,
  values: readonly unknown[],
): Promise<number> {
  const t = check(tx, text, values);
  const r = await t.client.query(text, [...values]);
  return r.rowCount ?? 0;
}
