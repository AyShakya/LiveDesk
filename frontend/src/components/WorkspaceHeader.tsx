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
      <div className="border-b border-violet-100 bg-white px-6 py-4 text-violet-600">
        Loading workspace...
      </div>
    )
  }

  return (

    <div className="border-b border-violet-100 bg-white/95 px-6 py-4 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <h1 className="title-font text-2xl font-semibold text-violet-900">
          {workspace.name}
        </h1>

        {workspace.role && (
          <span className="text-xs px-2.5 py-1 bg-pink-100 border border-pink-200 text-pink-700 rounded-full capitalize">
            {workspace.role}
          </span>
        )}

      </div>

      <div className="flex items-center gap-3">

        <button
          onClick={() => setShowMembers(true)}
          className="btn-secondary text-sm"
        >
          Members
        </button>

        <button
          onClick={() => setShowInvite(true)}
          className="btn-secondary text-sm"
        >
          Invite
        </button>

        <button
          onClick={() => navigate("/workspaces")}
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
        >
          Exit
        </button>

      </div>

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
