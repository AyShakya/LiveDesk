import pool from "../config/postgres.js";

export const documentCache = new Map();

export function getCachedDocument(docId) {
  return documentCache.get(String(docId)) ?? null;
}


export async function flushCachedDocument(docId) {
  const cachedDocument = getCachedDocument(docId);

  if (!cachedDocument?.dirty) {
    return cachedDocument ?? null;
  }

  await pool.query(
    `UPDATE documents
     SET content = $1, updated_at = NOW()
     WHERE id = $2`,
    [cachedDocument.content, docId],
  );

  cachedDocument.dirty = false;
  return cachedDocument;
}

export async function flushAndDeleteCachedDocument(docId) {
  await flushCachedDocument(docId);
  documentCache.delete(String(docId));
}
