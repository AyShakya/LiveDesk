import pool from "../../config/postgres.js";
import { documentCache } from "../../websocket/cacheModule.js";
import { broadcastLocalDoc } from "../../websocket/ws.server.js";
import { publishDocumentEvent } from "./document.pubsub.js";
import { applyOperations } from "./document.operations.js";

export async function handleDocEdit(ws, message) {
  const { operations, content } = message;

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
    console.log(`[${ws.serverInstanceId}] [EDIT_CACHE_LOAD] docId=${ws.docId} loaded from database`);
  }
  const doc = documentCache.get(ws.docId) || {};
  const previousLen = doc.content?.length || 0;
  doc.content = typeof content === "string" ? content : applyOperations(doc.content || "", operations);
  const newLen = doc.content?.length || 0;
  doc.lastAccess = Date.now();
  doc.dirty = true;
  documentCache.set(ws.docId, doc);

  console.log(`[${ws.serverInstanceId}] [EDIT_CACHED] userId=${ws.userId} docId=${ws.docId} contentLengthBefore=${previousLen} contentLengthAfter=${newLen} operationCount=${operations.length}`);

  const event = {
    type: "DOC_UPDATED",
    workspaceId: ws.workspaceId,
    docId: ws.docId,
    operations,
    updatedBy: ws.userId,
    content: doc.content,
    sourceInstance: ws.serverInstanceId,
  };

  broadcastLocalDoc(ws.workspaceId, ws.docId, event, {
    excludeUserId: ws.userId,
  });
  publishDocumentEvent(event);
}
