import http from "./http"

export async function getWorkspaceDocuments(workspaceId: string) {
  const res = await http.get(`/documents/workspace/${workspaceId}`)
  return res.data
}

export async function createDocument(workspaceId: string, title: string) {
  const res = await http.post("/documents", {
    workspaceId,
    title,
  })
  return res.data
}

export async function getDocument(docId: string) {
  const res = await http.get(`/documents/${docId}`)
  return res.data
}

export async function updateDocument(docId: string, data: { title?: string; content?: string }) {
  const res = await http.put(`/documents/${docId}`, data)
  return res.data
}

export function persistDocumentOnExit(docId: string, content: string) {
  const token = localStorage.getItem("token")

  if (!token || !import.meta.env.VITE_API_URL) {
    return
  }

  void fetch(`${import.meta.env.VITE_API_URL}/documents/${docId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
    keepalive: true,
  })
}

export async function deleteDocument(docId: string) {
  await http.delete(`/documents/${docId}`)
}
