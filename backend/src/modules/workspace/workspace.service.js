import crypto from "crypto";
import {
  createWorkspace,
  addMemeber,
  findWorkspaceByInvite,
  listUserWorkspaces,
  listWorkspaceMembers as repoListWorkspaceMembers,
  getMemberRole as repoGetMemberRole,
  updateWorkspaceName as repoUpdateWorkspaceName,
  deleteWorkspace as repoDeleteWorkspace,
} from "./workspace.repo.js";

function generateInviteCode() {
  return crypto.randomBytes(4).toString("hex");
}

export async function createWorkspaceForUser({ name, userId }) {
  if (!name || name.trim().length === 0) {
    throw new Error("INVALID_NAME");
  }
  const inviteCode = generateInviteCode();
  const workspace = await createWorkspace({
    name,
    inviteCode,
    createdBy: userId,
  });
  await addMemeber({ workspaceId: workspace.id, userId, role: "admin" });
  return workspace;
}

export async function joinWorkspace({ inviteCode, userId }) {
  const workspace = await findWorkspaceByInvite(inviteCode);
  if (!workspace) {
    throw new Error("WORKSPACE_NOT_FOUND");
  }
  await addMemeber({ workspaceId: workspace.id, userId, role: "member" });
  return workspace;
}

export async function getMyWorkspaces(userId) {
  return await listUserWorkspaces(userId);
}

export async function getWorkspaceMembers(workspaceId, userId) {
  // require that requesting user is a member
  const role = await repoGetMemberRole(workspaceId, userId);
  if (!role) throw new Error("FORBIDDEN");

  const members = await repoListWorkspaceMembers(workspaceId);
  return members;
}

export async function updateWorkspaceForUser({ workspaceId, name, userId }) {
  // require admin role
  const role = await repoGetMemberRole(workspaceId, userId);
  if (!role || role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  const updated = await repoUpdateWorkspaceName(workspaceId, name);
  if (!updated) throw new Error("NOT_FOUND");
  // map returned row to API shape
  return {
    id: updated.id,
    name: updated.name,
    inviteCode: updated.invite_code ?? updated.inviteCode,
    createdBy: updated.created_by ?? updated.createdBy,
  };
}

export async function deleteWorkspaceForUser({ workspaceId, userId }) {
  // require admin role
  const role = await repoGetMemberRole(workspaceId, userId);
  if (!role || role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  const deleted = await repoDeleteWorkspace(workspaceId);
  if (!deleted) throw new Error("NOT_FOUND");
  return true;
}
