import { useParams } from "react-router-dom"
import { useState } from "react"
import InviteModal from "../components/InviteModal"
import MembersModal from "../components/MembersModal"

export default function WorkspacePage() {

  const { id } = useParams<{ id: string }>()

  const [showMembers, setShowMembers] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  return (

    <div>

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-3xl font-bold">
          Workspace
        </h1>

        <div className="flex gap-3">

          <button
            onClick={() => setShowMembers(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Members
          </button>

          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Invite
          </button>

        </div>

      </div>

      <div className="bg-white border rounded-lg p-8 text-gray-500">

        Select a document from the sidebar or create one.

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