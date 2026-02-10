CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspaces (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_members (
  id SERIAL PRIMARY KEY,
  workspace_id INT REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  workspace_id INT REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW()
);
