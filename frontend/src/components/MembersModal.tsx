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

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[500px] max-h-[70vh] shadow-lg flex flex-col">

        {/* Header */}

        <div className="px-6 py-4 border-b flex justify-between items-center">

          <h2 className="text-lg font-semibold">
            Workspace Members
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>

        </div>


        {/* Body */}

        <div className="p-6 overflow-auto flex-1">

          {loading && (
            <div className="text-gray-500 text-sm">
              Loading members...
            </div>
          )}

          {!loading && members.length === 0 && (
            <div className="text-gray-500 text-sm">
              No members found
            </div>
          )}

          <div className="space-y-3">

            {members.map(member => (

              <div
                key={member.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
              >

                <div>

                  <div className="font-medium">
                    {member.name || "Unnamed"}
                  </div>

                  <div className="text-sm text-gray-500">
                    {member.email}
                  </div>

                </div>

                <div className="text-sm text-gray-600 capitalize">
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