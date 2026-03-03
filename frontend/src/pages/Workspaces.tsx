import { useEffect, useState } from "react"
import {
  getWorkspaces,
  createWorkspace,
  joinWorkspace,
} from "../api/workspaces"
import type { Workspace } from "../types/workspace"
import { useNavigate } from "react-router-dom"

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [newName, setNewName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await getWorkspaces()
    setWorkspaces(data)
  }

  async function handleCreate() {
    await createWorkspace(newName)
    setNewName("")
    load()
  }

  async function handleJoin() {
    await joinWorkspace(inviteCode)
    setInviteCode("")
    load()
  }

  return (
  <div>
    <h1 className="text-3xl font-bold mb-8">Your Workspaces</h1>

    {/* Create + Join Section */}
    <div className="grid md:grid-cols-2 gap-6 mb-10">
      {/* Create Workspace */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Create Workspace</h2>
        <input
          className="w-full border rounded-md px-3 py-2 mb-4"
          placeholder="Workspace name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create
        </button>
      </div>

      {/* Join Workspace */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Join Workspace</h2>
        <input
          className="w-full border rounded-md px-3 py-2 mb-4"
          placeholder="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <button
          onClick={handleJoin}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Join
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
            <h3 className="text-lg font-semibold mb-4">{ws.name}</h3>

            <button
              onClick={() => navigate(`/workspace/${ws.id}`)}
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-black"
            >
              Open Workspace
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)
}