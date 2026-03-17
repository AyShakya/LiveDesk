import { useEffect, useState } from "react";
import {
  getWorkspaces,
  createWorkspace,
  joinWorkspace,
} from "../api/workspaces";
import type { Workspace } from "../types/workspace";
import { useNavigate } from "react-router-dom";

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newName, setNewName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const data = await getWorkspaces();
    setWorkspaces(data);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    await createWorkspace(newName);
    setNewName("");
    load();
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    await joinWorkspace(inviteCode);
    setInviteCode("");
    load();
  }

  return (
    <div className="page-shell">
      <div className="mb-10">
        <p className="text-fuchsia-200 text-xs tracking-[0.2em] uppercase mb-2">Dashboard</p>
        <h1 className="title-font text-4xl font-bold text-white">Your Workspaces</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Create Workspace</h2>

          <input
            className="input mb-4"
            placeholder="Workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <button onClick={handleCreate} className="btn-primary w-full">
            Create Workspace
          </button>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Join Workspace</h2>

          <input
            className="input mb-4"
            placeholder="Invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />

          <button onClick={handleJoin} className="btn-secondary w-full">
            Join Workspace
          </button>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="card p-6 text-slate-300">
          No workspaces yet. Create or join one to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="card p-6 border border-white/10 hover:border-fuchsia-300/30 transition"
            >
              <h3 className="text-xl font-semibold mb-2 text-white">{ws.name}</h3>

              <p className="text-sm text-slate-300 mb-5">
                Invite: <span className="font-mono text-fuchsia-200">{ws.inviteCode}</span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/workspace/${ws.id}`)}
                  className="btn-primary"
                >
                  Open
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ws.inviteCode);
                  }}
                  className="btn-secondary"
                >
                  Copy Invite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
