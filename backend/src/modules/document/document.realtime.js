import pool from "../../config/postgres.js";
import { publishDocumentEvent } from "./document.pubsub.js";

export async function handleDocEdit(ws, message) {
  const { content } = message;

  // 1️⃣ Update truth
  const query = `
    UPDATE documents
    SET content = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, workspace_id
  `;
  const { rows } = await pool.query(query, [content, ws.docId]);

  if (!rows[0]) return;

  // 2️⃣ Publish event
  publishDocumentEvent({
    type: "DOC_UPDATED",
    workspaceId: ws.workspaceId,
    docId: ws.docId,
    content,
    updatedBy: ws.userId,
  });
}