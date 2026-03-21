import pool from "../../config/postgres.js";
import { documentCache } from "../../websocket/cacheModule.js";
import { broadcastLocalDoc } from "../../websocket/ws.server.js";
import { publishDocumentEvent } from "./document.pubsub.js";

function applyOperations(content, operations) {
  return operations.reduce((nextContent, operation) => {
    switch(operation.type){
      case "insert":
        return(
          nextContent.slice(0, operation.index) + operation.text + nextContent.slice(operation.index)
        );
      case "delete":
        return (
          nextContent.slice(0, operation.index) +
          nextContent.slice(operation.index + operation.length)
        );
      case "replace":
        return (
          nextContent.slice(0, operation.index) +
          operation.text +
          nextContent.slice(operation.index + operation.length)
        );
      default:
        return nextContent;
    }
  }, content);
}

export async function handleDocEdit(ws, message) {
  const { operations } = message;

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
  doc.content = applyOperations(doc.content || "", operations);
  doc.lastAccess = Date.now();
  doc.dirty = true;
  documentCache.set(ws.docId, doc);

  const event = {
    type: "DOC_UPDATED",
    workspaceId: ws.workspaceId,
    docId: ws.docId,
    operations,
    updatedBy: ws.userId,
    sourceInstance: ws.serverInstanceId,
  };

  broadcastLocalDoc(ws.workspaceId, ws.docId, event, {
    excludeUserId: ws.userId,
  });
  publishDocumentEvent(event);
}
