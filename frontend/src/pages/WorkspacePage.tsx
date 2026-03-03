import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  getWorkspaceDocuments,
  createDocument,
} from "../api/documents"
import type { Document } from "../types/document"

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [documents, setDocuments] = useState<Document[]>([])
  const [title, setTitle] = useState("")

  useEffect(() => {
    if (id) load()
  }, [id])

  async function load() {
    if (!id) return
    const data = await getWorkspaceDocuments(id)
    setDocuments(data)
  }

  async function handleCreate() {
    if (!id) return
    await createDocument(id, title)
    setTitle("")
    load()
  }

  return (
  <div>
    <h1 className="text-3xl font-bold mb-8">Documents</h1>

    {/* Create Document */}
    <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">Create Document</h2>
      <div className="flex gap-4">
        <input
          className="flex-1 border rounded-md px-3 py-2"
          placeholder="Document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create
        </button>
      </div>
    </div>

    {/* Documents List */}
    {documents.length === 0 ? (
      <div className="text-gray-500">
        No documents yet. Create one to start collaborating.
      </div>
    ) : (
      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white shadow-sm rounded-lg p-4 flex justify-between items-center"
          >
            <span className="font-medium">{doc.title}</span>

            <button
              onClick={() =>
                navigate(`/workspace/${id}/document/${doc.id}`)
              }
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-black"
            >
              Open
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)
}