import pool from "../../config/postgres.js";
import { documentCache } from "../../websocket/cacheModule.js";
import { publishDocumentEvent } from "./document.pubsub.js";

export async function handleDocEdit(ws, message) {
  const { content } = message;

  if (!documentCache.has(ws.docId)) {
    const { rows } = await pool.query(
      `SELECT content FROM documents WHERE id=$1`,
      [ws.docId],
    );

    documentCache.set(ws.docId, {
      content: rows[0]?.content || "",
      lastAccess: Date.now(),
      dirty: false,
    });
  }
  const doc = documentCache.get(ws.docId) || {};
  doc.content = content;
  doc.lastAccess = Date.now();
  doc.dirty = true;
  documentCache.set(ws.docId, doc);

  publishDocumentEvent({
    type: "DOC_UPDATED",
    workspaceId: ws.workspaceId,
    docId: ws.docId,
    content,
    updatedBy: ws.userId,
  });
}
setInterval(() => {
  const now = Date.now();
  const IDLE_LIMIT = 10 * 60 * 1000; // 10 minutes

  for (const [docId, doc] of documentCache) {
    if (now - doc.lastAccess > IDLE_LIMIT) {
      documentCache.delete(docId);
    }
  }
}, 600000);
setInterval(async () => {
  const BATCH_LIMIT = 100;
  let processed = 0;

  for (const [docId, doc] of documentCache) {
    if (!doc.dirty) continue;

    try {
      await pool.query(
        `UPDATE documents
         SET content=$1, updated_at=NOW()
         WHERE id=$2`,
        [doc.content, docId],
      );

      doc.dirty = false;

      processed++;

      if (processed >= BATCH_LIMIT) {
        break;
      }
    } catch (err) {
      console.error("Failed to persist document", err);
    }
  }
}, 5000);
