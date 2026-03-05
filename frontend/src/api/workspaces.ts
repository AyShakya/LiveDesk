import http from "./http"
import type { Workspace } from "../types/workspace"

export async function getWorkspaces() {
  const res = await http.get<Workspace[]>("/workspaces")
  return res.data
}

export async function createWorkspace(name: string) {
  const res = await http.post<Workspace>("/workspaces", { name })
  return res.data
}

export async function joinWorkspace(inviteCode: string) {
  const res = await http.post<Workspace>("/workspaces/join", {
    inviteCode,
  })
  return res.data
}

export async function getWorkspaceMembers(workspaceId: string) {
  const res = await http.get(`/workspaces/${workspaceId}/members`)
  return res.data
}

export async function getWorkspace(workspaceId: string) {
  const res = await http.get("/workspaces")
  return res.data.find((w: any) => String(w.id) === String(workspaceId))
}