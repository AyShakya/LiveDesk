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
    await createWorkspace(newName);
    setNewName("");
    load();
  }

  async function handleJoin() {
    await joinWorkspace(inviteCode);
    setInviteCode("");
    load();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Your Workspaces</h1>
      </div>

      {/* Create + Join Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Create Workspace</h2>

          <input
            className="input mb-4"
            placeholder="Workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <button onClick={handleCreate} className="btn-primary">
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

          <button onClick={handleJoin} className="btn-secondary">
            Join Workspace
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      {workspaces.length === 0 ? (
        <div className="text-gray-500">
          No workspaces yet. Create or join one to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold mb-2">{ws.name}</h3>

              <p className="text-sm text-gray-500 mb-4">
                Invite: <span className="font-mono">{ws.inviteCode}</span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/workspace/${ws.id}`)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-black"
                >
                  Open Workspace
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ws.inviteCode);
                  }}
                  className="px-3 py-2 border rounded-md text-sm"
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
