import pool from "../../config/postgres.js";

export async function createWorkspace({ name, inviteCode, createdBy }) {
  const query = `
    INSERT INTO workspaces (name, invite_code, created_by)
    VALUES ($1, $2, $3)
    RETURNING id, name, invite_code, created_by`;

  const { rows } = await pool.query(query, [name, inviteCode, createdBy]);
  const ws = rows[0];

  return {
    id: ws.id,
    name: ws.name,
    inviteCode: ws.invite_code,
    createdBy: ws.created_by,
  };
}

export async function addMemeber({ workspaceId, userId, role }) {
  const query = `
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (workspace_id, user_id)
    DO UPDATE SET role = EXCLUDED.role
    RETURNING *`;

  const { rows } = await pool.query(query, [workspaceId, userId, role]);
  return rows[0];
}

export async function findWorkspaceByInvite(inviteCode) {
  const query = `
    SELECT id, name, invite_code
    FROM workspaces
    WHERE invite_code = $1`;

  const { rows } = await pool.query(query, [inviteCode]);
  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    name: rows[0].name,
    inviteCode: rows[0].invite_code,
  };
}

export async function listUserWorkspaces(userId) {
  const query = `
    SELECT w.id, w.name, w.invite_code, wm.role
    FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE wm.user_id = $1
    ORDER BY w.created_at DESC`;

  const { rows } = await pool.query(query, [userId]);
  return rows.map((ws) => ({
    id: ws.id,
    name: ws.name,
    inviteCode: ws.invite_code,
    role: ws.role,
  }));
}

export async function listWorkspaceMembers(workspaceId) {
  const query = `
    SELECT u.id, u.email, u.name, wm.role
    FROM workspace_members wm
    JOIN users u ON u.id = wm.user_id
    WHERE wm.workspace_id = $1
    ORDER BY u.email
  `;
  const { rows } = await pool.query(query, [workspaceId]);
  // map to a clean shape
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
  }));
}

export async function getMemberRole(workspaceId, userId) {
  const query = `
    SELECT role FROM workspace_members
    WHERE workspace_id = $1 AND user_id = $2
  `;
  const { rows } = await pool.query(query, [workspaceId, userId]);
  return rows[0]?.role ?? null;
}

export async function updateWorkspaceName(workspaceId, name) {
  const query = `
    UPDATE workspaces
    SET name = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, name, invite_code, created_by
  `;
  const { rows } = await pool.query(query, [name, workspaceId]);
  return rows[0] ?? null;
}

export async function deleteWorkspace(workspaceId) {
  const query = `
    DELETE FROM workspaces
    WHERE id = $1
    RETURNING id
  `;

  const { rows } = await pool.query(query, [workspaceId]);
  return rows[0] ?? null;
}