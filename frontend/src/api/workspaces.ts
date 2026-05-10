import http from "./http"
import type { Workspace } from "../types/workspace"
import type { Member } from "../types/member"

export async function getWorkspaces(): Promise<Workspace[]> {
  const res = await http.get<{ workspaces: Workspace[]; instanceId?: string } | Workspace[]>("/workspaces")
  return Array.isArray(res.data) ? res.data : (res.data.workspaces || [])
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

export async function getWorkspaceMembers(workspaceId: string): Promise<Member[]> {
  const res = await http.get<{ members: Member[]; instanceId?: string } | Member[]>(`/workspaces/${workspaceId}/members`)
  return Array.isArray(res.data) ? res.data : (res.data.members || [])
}

export async function getWorkspace(workspaceId: string): Promise<Workspace | undefined> {
  const res = await http.get<{ workspaces: Workspace[]; instanceId?: string }>("/workspaces")
  const workspaces = Array.isArray(res.data) ? res.data : (res.data.workspaces || [])
  return workspaces.find((w: Workspace) => String(w.id) === String(workspaceId))
}