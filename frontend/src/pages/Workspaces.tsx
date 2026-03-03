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
      <h1>Your Workspaces</h1>

      <div>
        <h3>Create Workspace</h3>
        <input
          placeholder="Workspace name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={handleCreate}>Create</button>
      </div>

      <div>
        <h3>Join Workspace</h3>
        <input
          placeholder="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <button onClick={handleJoin}>Join</button>
      </div>

      <ul>
        {workspaces.map((ws) => (
          <li key={ws.id}>
            {ws.name}
            <button onClick={() => navigate(`/workspace/${ws.id}`)}>
              Open
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}