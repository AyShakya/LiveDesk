import pool from "../../config/postgres.js";
import { createDocument, getDocument, listDocuments, updateDocument } from "./document.repo.js";

async function isMemeber(userId, workspaceId){
    const query = `
    SELECT 1
    FROM workspace_members
    WHERE user_id = $1 AND workspace_id = $2`;
    const {rows} = await pool.query(query, [userId, workspaceId]);
    return rows.length > 0;
}

export async function createDoc({workspaceId, title, userId}){
    const allowed = await isMemeber(userId, workspaceId);
    if(!allowed){
        throw new Error('FORBIDDEN');
    }
    return await createDocument({workspaceId, title});
}

export async function listDocs({ workspaceId, userId}){
    const allowed = await isMemeber(userId, workspaceId);
    if(!allowed){
        throw new Error('FORBIDDEN');
    }
    return await listDocuments(workspaceId);
}

export async function updateDocs({docId, content, userId}){
    const doc = await getDocument(docId);
    if(!doc){
        throw new Error('NOT_FOUND');
    }
    const allowed = await isMemeber(userId, doc.workspace_id);
    if(!allowed){
        throw new Error('FORBIDDEN');
    }
    return await updateDocument({docId, content});
}

export async function getDoc({docId, userId}){
    const doc = await getDocument(docId);
    if(!doc){
        throw new Error('NOT_FOUND');
    }
    const allowed = await isMemeber(userId, doc.workspace_id);
    if(!allowed){
        throw new Error('FORBIDDEN');
    }
    return doc;
}