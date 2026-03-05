import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  getWorkspaceDocuments,
  createDocument
} from "../api/documents"
import DocumentMenu from "./DocumentMenu"
import type { Document } from "../types/document"

interface Props {
  workspaceId: string
}

export default function DocumentsSidebar({ workspaceId }: Props) {

  const navigate = useNavigate()
  const { docId } = useParams()

  const [documents, setDocuments] = useState<Document[]>([])
  const [title, setTitle] = useState("")

  useEffect(() => {
    load()
  }, [workspaceId])

  async function load() {

    const data = await getWorkspaceDocuments(workspaceId)
    setDocuments(data)

  }

  async function handleCreate() {

    if (!title.trim()) return

    const doc = await createDocument(workspaceId, title)

    setTitle("")

    navigate(`/workspace/${workspaceId}/document/${doc.id}`)

    load()
  }

  function renameDoc(id: number, newTitle: string) {

    setDocuments(prev =>
      prev.map(d =>
        d.id === id ? { ...d, title: newTitle } : d
      )
    )

  }

  function removeDoc(id: number) {

    setDocuments(prev => prev.filter(d => d.id !== id))

    if (String(id) === docId) {
      navigate(`/workspace/${workspaceId}`)
    }

  }

  return (

    <aside className="w-72 bg-white border-r flex flex-col">

      {/* Header */}

      <div className="px-6 py-4 border-b">
        <h2 className="font-semibold text-lg">
          Documents
        </h2>
      </div>


      {/* Document List */}

      <div className="flex-1 overflow-auto p-3 space-y-1">

        {documents.map(doc => {

          const active = String(doc.id) === docId

          return (

            <div
              key={doc.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-100"
              }`}
            >

              <div
                onClick={() =>
                  navigate(`/workspace/${workspaceId}/document/${doc.id}`)
                }
                className="flex-1 truncate"
              >
                {doc.title}
              </div>

              <DocumentMenu
                docId={doc.id}
                title={doc.title}
                onRename={(newTitle) => renameDoc(doc.id, newTitle)}
                onDelete={() => removeDoc(doc.id)}
              />

            </div>

          )

        })}

      </div>


      {/* Create Document */}

      <div className="border-t p-4">

        <input
          className="w-full border rounded-lg px-3 py-2 mb-3"
          placeholder="New document..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Create
        </button>

      </div>

    </aside>

  )

}