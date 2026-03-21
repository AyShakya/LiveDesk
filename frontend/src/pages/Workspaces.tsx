import { useEffect, useState } from "react";
import {
  getWorkspaces,
  createWorkspace,
  joinWorkspace,
} from "../api/workspaces";
import type { Workspace } from "../types/workspace";
import { useNavigate } from "react-router-dom";
import { DashboardSkeleton } from "../components/ui/Skeleton";

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newName, setNewName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getWorkspaces();
    setWorkspaces(data);
    setLoading(false);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    await createWorkspace(newName);
    setNewName("");
    await load();
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    await joinWorkspace(inviteCode);
    setInviteCode("");
    await load();
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="page-shell">
      <div className="mb-10 fade-up">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-pink-500">Dashboard</p>
        <h1 className="title-font text-4xl font-bold text-violet-900">Your Workspaces</h1>
      </div>

      <div className="mb-10 grid gap-6 md:grid-cols-2">
        <div className="card p-6 transition hover:-translate-y-0.5">
          <h2 className="mb-4 text-lg font-semibold text-violet-900">Create Workspace</h2>

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

        <div className="card p-6 transition hover:-translate-y-0.5">
          <h2 className="mb-4 text-lg font-semibold text-violet-900">Join Workspace</h2>

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
        <div className="card p-6 text-violet-700">
          No workspaces yet. Create or join one to get started.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="card border border-violet-100 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-pink-200"
            >
              <h3 className="mb-2 text-xl font-semibold text-violet-900">{ws.name}</h3>

              <p className="mb-5 text-sm text-violet-700">
                Invite: <span className="font-mono text-pink-500">{ws.inviteCode}</span>
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
