import { useEffect, useState } from "react"
import { getWorkspaceMembers } from "../api/workspaces"
import type { Member } from "../types/member"

interface Props {
  workspaceId: string
  onClose: () => void
}

export default function MembersModal({ workspaceId, onClose }: Props) {

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const data = await getWorkspaceMembers(workspaceId)
      setMembers(data)
    } catch (err) {
      console.error("Failed to load members", err)
    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

      <div className="glass-card w-[520px] max-h-[70vh] flex flex-col">

        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">

          <h2 className="text-lg font-semibold title-font">
            Workspace Members
          </h2>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            ✕
          </button>

        </div>

        <div className="p-6 overflow-auto flex-1">

          {loading && (
            <div className="text-slate-300 text-sm">
              Loading members...
            </div>
          )}

          {!loading && members.length === 0 && (
            <div className="text-slate-300 text-sm">
              No members found
            </div>
          )}

          <div className="space-y-3">

            {members.map(member => (

              <div
                key={member.id}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >

                <div>

                  <div className="font-medium">
                    {member.name || "Unnamed"}
                  </div>

                  <div className="text-sm text-slate-300">
                    {member.email}
                  </div>

                </div>

                <div className="text-sm text-fuchsia-200 capitalize">
                  {member.role}
                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  )

}
