import pool from "../../config/postgres.js";

export async function createDocument({workspaceId, title}) {
    const query = `
    INSERT INTO documents (workspace_id, title)
    VALUES ($1, $2)
    RETURNING id, workspace_id, title, content, updated_at`;

    const {rows} = await pool.query(query, [workspaceId, title]);
    return rows[0];
}

export async function listDocuments(workspaceId) {
    const query = `
    SELECT id, title, updated_at
    FROM documents
    WHERE workspace_id = $1 
    ORDER BY updated_at DESC`;

    const {rows} = await pool.query(query, [workspaceId]);  
    return rows;
}

export async function updateDocument({ docId, title, content }) {
  const updates = [];
  const values = [];

  if (title !== undefined) {
    values.push(title);
    updates.push(`title = $${values.length}`);
  }

  if (content !== undefined) {
    values.push(content);
    updates.push(`content = $${values.length}`);
  }

  if (updates.length === 0) {
    return getDocument(docId);
  }

  values.push(docId);

  const query = `
    UPDATE documents
    SET ${updates.join(", ")}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING id, workspace_id, title, content, updated_at`;

  const { rows } = await pool.query(query, values);
  return rows[0] ?? null;
}

export async function getDocument(docId) {
    const query = `
    SELECT id, workspace_id, title, content, updated_at
    FROM documents
    WHERE id = $1`;

    const {rows} = await pool.query(query, [docId]);
    return rows[0]?? null;
}

export async function deleteDocument(docId) {
  const query = `
    DELETE FROM documents
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [docId]);
  return rows[0] ?? null;
}

export async function isWorkspaceMember(workspaceId, userId) {
  const q = `
    SELECT 1 FROM workspace_members
    WHERE workspace_id = $1 AND user_id = $2
  `;
  const { rows } = await pool.query(q, [workspaceId, userId]);
  return rows.length > 0;
}
