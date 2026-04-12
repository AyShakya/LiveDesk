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
    <>
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 bg-[#fefdf1]/90 px-4 py-4 backdrop-blur md:px-6">
        <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0efe4] text-xl text-[#6236ff] transition hover:bg-[#e8e6d8] lg:hidden"
        >
          ☰
        </button>
          <h1 className="title-font truncate text-3xl font-bold text-[#373830] sm:text-4xl">
          {workspace.name}
          </h1>

          {workspace.role && (
            <span className="hidden rounded-full bg-[#ffc3bf] px-3 py-1 text-xs uppercase tracking-[0.05em] text-[#8a2d2b] sm:inline-flex">
              {workspace.role}
            </span>
          )}
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <button
            onClick={() => setShowMembers(true)}
            className="btn-secondary whitespace-nowrap px-4 py-2 text-sm"
          >
            Members
          </button>

          <button
            onClick={() => setShowInvite(true)}
            className="btn-primary whitespace-nowrap px-5 py-2 text-sm"
          >
            Invite
          </button>

          <button
            onClick={() => navigate("/workspaces")}
            className="rounded-full bg-[#f6d7d5] px-4 py-2 text-sm font-semibold text-[#8a2d2b] transition hover:bg-[#efc6c2]"
          >
            Exit
          </button>
        </div>
      </div>

      {showMembers && id && (
        <MembersModal workspaceId={id} onClose={() => setShowMembers(false)} />
      )}

      {showInvite && id && (
        <InviteModal workspaceId={id} onClose={() => setShowInvite(false)} />
      )}
    </>
  )
}
