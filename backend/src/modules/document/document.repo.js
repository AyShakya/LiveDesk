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

export async function updateDocument({docId, content}) {
    const query = `
    UPDATE documents
    SET content = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, title, content, updated_at`;

    const {rows} = await pool.query(query, [content, docId]);
    return rows[0];
}

export async function getDocument(docId) {
    const query = `
    SELECT id, workspace_id, title, content, updated_at
    FROM documents
    WHERE id = $1`;

    const {rows} = await pool.query(query, [docId]);
    return rows[0];
}