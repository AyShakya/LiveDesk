import pool from "../../config/postgres.js";
import { documentCache } from "../../websocket/cacheModule.js";
import { broadcastLocalDoc } from "../../websocket/ws.server.js";
import { publishDocumentEvent } from "./document.pubsub.js";

function applyDiff(oldText, diff) {
  return (
    oldText.slice(0, diff.start) +
    diff.text +
    oldText.slice(diff.end)
  )
}

export async function handleDocEdit(ws, message) {
  const { diff } = message;

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
  doc.content = applyDiff(doc.content || "", diff);
  doc.lastAccess = Date.now();
  doc.dirty = true;
  documentCache.set(ws.docId, doc);

  broadcastLocalDoc(ws.workspaceId, ws.docId, {
    type: "DOC_UPDATED",
    workspaceId: ws.workspaceId,
    docId: ws.docId,
    diff,
    updatedBy: ws.userId,
  });
  publishDocumentEvent({
    type: "DOC_UPDATED",
    workspaceId: ws.workspaceId,
    docId: ws.docId,
    diff,
    updatedBy: ws.userId,
  });
}
