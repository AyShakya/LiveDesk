import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { getWorkspaces } from "../api/workspaces"
import MembersModal from "./MembersModal"
import InviteModal from "./InviteModal"

import type { Workspace } from "../types/workspace"

export default function WorkspaceHeader() {

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)

  const [showMembers, setShowMembers] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    loadWorkspace()
  }, [id])

  async function loadWorkspace() {

    try {

      const list: Workspace[] = await getWorkspaces()

      const ws = list.find(w => String(w.id) === id)

      if (ws) setWorkspace(ws)

    } catch (err) {

      console.error("Failed to load workspace", err)

    }

  }

  if (!workspace) {
    return (
      <div className="border-b bg-white px-6 py-4">
        Loading workspace...
      </div>
    )
  }

  return (

    <div className="border-b bg-white px-6 py-4 flex items-center justify-between">

      {/* Workspace title */}

      <div className="flex items-center gap-3">

        <h1 className="text-xl font-semibold">
          {workspace.name}
        </h1>

        {workspace.role && (
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
            {workspace.role}
          </span>
        )}

      </div>


      {/* Actions */}

      <div className="flex items-center gap-3">

        <button
          onClick={() => setShowMembers(true)}
          className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 text-sm"
        >
          Members
        </button>

        <button
          onClick={() => setShowInvite(true)}
          className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 text-sm"
        >
          Invite
        </button>

        <button
          onClick={() => navigate("/workspaces")}
          className="px-3 py-1.5 border rounded-lg hover:bg-gray-100 text-sm"
        >
          Exit
        </button>

      </div>


      {/* Modals */}

      {showMembers && id && (
        <MembersModal
          workspaceId={id}
          onClose={() => setShowMembers(false)}
        />
      )}

      {showInvite && id && (
        <InviteModal
          workspaceId={id}
          onClose={() => setShowInvite(false)}
        />
      )}

    </div>

  )

}