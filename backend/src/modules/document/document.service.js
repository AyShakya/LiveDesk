import { createDocument, getDocument, listDocuments, updateDocument } from "./document.repo.js";
import {
  deleteDocument as repoDeleteDocument,
  isWorkspaceMember as repoIsWorkspaceMember,
} from "./document.repo.js";

export async function createDoc({workspaceId, title, userId}){
    const allowed = await repoIsWorkspaceMember(workspaceId, userId);
    if(!allowed){
        throw new Error('FORBIDDEN');
    }
    return await createDocument({workspaceId, title});
}

export async function listDocs({ workspaceId, userId}){
    const allowed = await repoIsWorkspaceMember(workspaceId, userId);
    if(!allowed){
        throw new Error('FORBIDDEN');
    }
    return await listDocuments(workspaceId);
}

export async function updateDocs({ docId, title, content, userId }) {
    const doc = await getDocument(docId);
    if(!doc){
        throw new Error('NOT_FOUND');
    }
    const allowed = await repoIsWorkspaceMember(doc.workspace_id, userId);
    if(!allowed){
        throw new Error('FORBIDDEN');
    }
    return await updateDocument({ docId, title, content });
}

export async function getDoc({docId, userId}){
    const doc = await getDocument(docId);
    if(!doc){
        throw new Error('NOT_FOUND');
    }
    const allowed = await repoIsWorkspaceMember (doc.workspace_id, userId);
    if(!allowed){
        throw new Error('FORBIDDEN');
    }
    return doc;
}

export async function deleteDoc({ docId, userId }) {
  const doc = await getDocument(docId);

  if (!doc) {
    throw new Error("NOT_FOUND");
  }

  const allowed = await repoIsWorkspaceMember(doc.workspace_id, userId);

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  await repoDeleteDocument(docId);

  return true;
}