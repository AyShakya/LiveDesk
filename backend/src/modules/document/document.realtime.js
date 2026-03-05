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

  broadcastLocalDoc(ws.workspaceId, ws.docId, {
    type: "DOC_UPDATED",
    workspaceId: ws.workspaceId,
    docId: ws.docId,
    content,
    updatedBy: ws.userId,
  });
  publishDocumentEvent({
    type: "DOC_UPDATED",
    workspaceId: ws.workspaceId,
    docId: ws.docId,
    content,
    updatedBy: ws.userId,
  });
}
