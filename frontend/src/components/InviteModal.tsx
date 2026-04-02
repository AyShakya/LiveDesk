import { useEffect, useState } from "react"
import { getWorkspace } from "../api/workspaces"
import type { Workspace } from "../types/workspace"

interface Props {
  workspaceId: string
  onClose: () => void
}

export default function InviteModal({ workspaceId, onClose }: Props) {

  const [workspace, setWorkspace] = useState<Workspace | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await getWorkspace(workspaceId)
    setWorkspace(data)
  }

  if (!workspace) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/20 px-4">
        <div className="glass-card p-6">
          Loading invite...
        </div>
      </div>
    )
  }

  const inviteCode = workspace.inviteCode
  const inviteLink = `${window.location.origin}/workspaces?invite=${workspace.inviteCode}`

  function copyCode() {
    navigator.clipboard.writeText(inviteCode)
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink)
  }

  return (

    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-violet-950/20 p-4 sm:items-center">

      <div className="glass-card w-full max-w-[520px] max-h-[calc(100dvh-2rem)] overflow-auto">

        <div className="px-6 py-4 border-b border-violet-100 flex justify-between items-center">

          <h2 className="text-lg font-semibold title-font">
            Invite to Workspace
          </h2>

          <button onClick={onClose} className="text-violet-700 hover:text-violet-900">
            ✕
          </button>

        </div>

        <div className="p-6 space-y-6">

          <div>

            <div className="text-sm text-violet-700 mb-2">
              Invite Code
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="flex-1 border border-violet-200 rounded-xl px-3 py-2 font-mono bg-white">
                {workspace.inviteCode}
              </div>

              <button
                onClick={copyCode}
                className="btn-secondary"
              >
                Copy
              </button>

            </div>

          </div>

          <div>

            <div className="text-sm text-violet-700 mb-2">
              Invite Link
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="flex-1 break-all border border-violet-200 rounded-xl bg-white px-3 py-2 text-sm">
                {inviteLink}
              </div>

              <button
                onClick={copyLink}
                className="btn-secondary"
              >
                Copy
              </button>

            </div>

          </div>

          <div className="text-sm text-violet-700">
            Share this invite code or link with teammates so they can join the workspace.
          </div>

        </div>

      </div>

    </div>

  )
}
