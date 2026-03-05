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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">
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

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[480px] shadow-lg">

        {/* Header */}

        <div className="px-6 py-4 border-b flex justify-between items-center">

          <h2 className="text-lg font-semibold">
            Invite to Workspace
          </h2>

          <button onClick={onClose}>
            ✕
          </button>

        </div>


        {/* Body */}

        <div className="p-6 space-y-6">


          {/* Invite Code */}

          <div>

            <div className="text-sm text-gray-500 mb-2">
              Invite Code
            </div>

            <div className="flex gap-3">

              <div className="flex-1 border rounded-lg px-3 py-2 font-mono">
                {workspace.inviteCode}
              </div>

              <button
                onClick={copyCode}
                className="px-3 py-2 border rounded-lg hover:bg-gray-100"
              >
                Copy
              </button>

            </div>

          </div>


          {/* Invite Link */}

          <div>

            <div className="text-sm text-gray-500 mb-2">
              Invite Link
            </div>

            <div className="flex gap-3">

              <div className="flex-1 border rounded-lg px-3 py-2 text-sm truncate">
                {inviteLink}
              </div>

              <button
                onClick={copyLink}
                className="px-3 py-2 border rounded-lg hover:bg-gray-100"
              >
                Copy
              </button>

            </div>

          </div>


          {/* Instructions */}

          <div className="text-sm text-gray-500">

            Share this invite code or link with teammates so they can join the workspace.

          </div>

        </div>

      </div>

    </div>

  )
}