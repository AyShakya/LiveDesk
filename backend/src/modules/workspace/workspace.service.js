import crypto from 'crypto';
import { addMemeber, createWorkspace, findWorkspaceByInvite, listUserWorkspaces } from './workspace.repo.js';

function generateInviteCode(){
    return crypto.randomBytes(4).toString('hex');
}

export async function createWorkspaceForUser({name, userId}){
    const inviteCode = generateInviteCode();

    const workspace = await createWorkspace({name, inviteCode, createdBy: userId});
    await addMemeber({workspaceId: workspace.id, userId, role: 'admin'});
    return workspace;
}

export async function joinWorkspace({inviteCode, userId}){
    const workspace = await findWorkspaceByInvite(inviteCode);  
    if(!workspace){
        throw new Error('WORKSPACE_NOT_FOUND');
    }
    await addMemeber({workspaceId: workspace.id, userId, role: 'member'});
    return workspace;
}

export async function getMyWorkspaces(userId){
    return await listUserWorkspaces(userId);
}