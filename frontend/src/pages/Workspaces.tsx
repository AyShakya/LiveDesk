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
    <div className="page-shell pb-16">
      <div className="mb-10 fade-up">
        <h1 className="title-font text-6xl font-extrabold tracking-[-0.02em] text-[#373830]">Your Workspaces</h1>
        <p className="mt-4 max-w-3xl text-3xl/relaxed text-[#616458]">
          Manage your digital hubs. Create new environments for your teams or join existing creative spaces with a single code.
        </p>
      </div>

      <div className="mb-14 grid gap-8 lg:grid-cols-2">
        <div className="card rounded-[2.25rem] bg-white/90 p-8">
          <h2 className="title-font mb-2 text-5xl font-bold text-[#373830]">Create Workspace</h2>
          <p className="mb-6 text-lg text-[#66695e]">Start a fresh project and invite your collaborators.</p>

          <input
            className="input mb-5"
            placeholder="Workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <button onClick={handleCreate} className="btn-primary w-full text-lg">
            Launch Workspace
          </button>
        </div>

        <div className="card rounded-[2.25rem] bg-white/90 p-8">
          <h2 className="title-font mb-2 text-5xl font-bold text-[#373830]">Join Workspace</h2>
          <p className="mb-6 text-lg text-[#66695e]">Enter your invitation code to access an existing workspace.</p>

          <input
            className="input mb-5 uppercase tracking-[0.08em]"
            placeholder="Invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />

          <button onClick={handleJoin} className="w-full rounded-full bg-[#ac403e] px-6 py-3 text-lg font-semibold text-white transition hover:brightness-105">
            Join Team
          </button>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="rounded-3xl bg-[#fbfaed] p-8 text-lg text-[#616458]">
          No workspaces yet. Create or join one to get started.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="rounded-[1.75rem] bg-[#fbfaed] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_20px_40px_rgba(55,56,48,0.08)]"
            >
              <h3 className="title-font mb-2 text-4xl font-bold text-[#373830]">{ws.name}</h3>

              <p className="mb-5 text-sm text-[#66695e]">
                Invite: <span className="font-mono text-[#6236ff]">{ws.inviteCode}</span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/workspace/${ws.id}`)}
                  className="btn-primary min-w-28"
                >
                  Open
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ws.inviteCode);
                  }}
                  className="btn-secondary min-w-32"
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
