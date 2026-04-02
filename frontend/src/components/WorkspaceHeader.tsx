import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { getWorkspaces } from "../api/workspaces"
import MembersModal from "./MembersModal"
import InviteModal from "./InviteModal"

import type { Workspace } from "../types/workspace"
import { WorkspaceHeaderSkeleton } from "./ui/Skeleton"

interface Props {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export default function WorkspaceHeader({ onToggleSidebar, isSidebarOpen }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  const [showMembers, setShowMembers] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    void loadWorkspace()
  }, [id])

  async function loadWorkspace() {
    setLoading(true)

    try {
      const list: Workspace[] = await getWorkspaces()
      const ws = list.find((item) => String(item.id) === id)

      if (ws) {
        setWorkspace(ws)
      }
    } catch (err) {
      console.error("Failed to load workspace", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !workspace) {
    return <WorkspaceHeaderSkeleton />
  }

  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-violet-100 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200 bg-white text-xl text-violet-700 transition hover:bg-violet-50 lg:hidden"
        >
          ☰
        </button>
        <h1 className="title-font text-2xl font-semibold text-violet-900">
          {workspace.name}
        </h1>

        {workspace.role && (
          <span className="rounded-full border border-pink-200 bg-pink-100 px-2.5 py-1 text-xs capitalize text-pink-700">
            {workspace.role}
          </span>
        )}
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
        <button onClick={() => setShowMembers(true)} className="btn-secondary text-sm">
          Members
        </button>

        <button onClick={() => setShowInvite(true)} className="btn-secondary text-sm">
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
        <MembersModal workspaceId={id} onClose={() => setShowMembers(false)} />
      )}

      {showInvite && id && (
        <InviteModal workspaceId={id} onClose={() => setShowInvite(false)} />
      )}
    </div>
  )
}
