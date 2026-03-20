CREATE INDEX idx_workspace_members_user 
ON workspace_members(user_id);

CREATE INDEX idx_workspace_members_workspace 
ON workspace_members(workspace_id);

CREATE INDEX idx_documents_workspace 
ON documents(workspace_id);

CREATE INDEX idx_documents_workspace_updated 
ON documents(workspace_id, updated_at DESC);