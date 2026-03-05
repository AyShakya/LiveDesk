import http from "./http"
import type { Document } from "../types/document"

export async function getWorkspaceDocuments(workspaceId: string) {
  const res = await http.get<Document[]>(
    `/documents/workspace/${workspaceId}`
  )
  return res.data
}

export async function createDocument(workspaceId: string, title: string) {
  const res = await http.post<Document>(`/documents`, {
    workspaceId,
    title,
  })
  return res.data
}

export async function getDocument(docId: string) {
  const res = await http.get<Document>(`/documents/${docId}`)
  return res.data
}

export async function updateDocument(
  docId: string,
  content: string
) {
  const res = await http.put<Document>(`/documents/${docId}`, {
    content,
  })
  return res.data
}