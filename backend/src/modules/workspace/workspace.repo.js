import pool from '../../config/postgres.js';

export async function createWorkspace({name, inviteCode, createdBy}) {
    const query = `
    INSERT INTO workspaces (name, invite_code, created_by)
    VALUES ($1, $2, $3)
    RETURNING id, name, invite_code, created_by`;

    const {rows} = await pool.query(query, [name, inviteCode, createdBy]);
    return rows[0];
}

export async function addMemeber({workspaceId, userId, role}){
    const query = `
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (workspace_id, user_id)
    DO UPDATE SET role = EXCLUDED.role
    RETURNING *`

    const {rows} = await pool.query(query, [workspaceId, userId, role]);
    return rows[0];
}

export async function findWorkspaceByInvite(inviteCode){
    const query = `
    SELECT id, name, invite_code
    FROM workspaces
    WHERE invite_code = $1`;

    const {rows} = await pool.query(query, [inviteCode]);
    return rows[0];
}

export async function listUserWorkspaces(userId){
    const query = `
    SELECT w.id, w.name, w.invite_code, wm.role
    FROM workspaces w
    JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE wm.user_id = $1
    ORDER BY w.created_at DESC`;
    
    const {rows} = await pool.query(query, [userId]);
    return rows;
}