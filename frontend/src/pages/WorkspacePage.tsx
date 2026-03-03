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
      <h1>Workspace</h1>

      <div>
        <input
          placeholder="New document title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={handleCreate}>Create Document</button>
      </div>

      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            {doc.title}
            <button
              onClick={() =>
                navigate(`/workspace/${id}/document/${doc.id}`)
              }
            >
              Open
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}