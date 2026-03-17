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

  const { docId } = useParams<{ docId?: string }>()

  const [documents, setDocuments] = useState<Document[]>([])
  const [title, setTitle] = useState<string>("")

  useEffect(() => {
    load()
  }, [workspaceId])

  async function load(): Promise<void> {

    try {

      const data: Document[] = await getWorkspaceDocuments(workspaceId)

      setDocuments(data)

    } catch (err) {

      console.error("Failed to load documents", err)

    }

  }

  async function handleCreate(): Promise<void> {

    if (!title.trim()) return

    try {

      const doc: Document = await createDocument(workspaceId, title)

      setTitle("")

      navigate(`/workspace/${workspaceId}/document/${doc.id}`)

      await load()

    } catch (err) {

      console.error("Failed to create document", err)

    }

  }

  function renameDoc(id: string, newTitle: string): void {

    setDocuments((prev: Document[]) =>
      prev.map((d: Document) =>
        d.id === id ? { ...d, title: newTitle } : d
      )
    )

  }

  function removeDoc(id: string): void {

    setDocuments((prev: Document[]) =>
      prev.filter((d: Document) => d.id !== id)
    )

    if (docId && String(id) === docId) {
      navigate(`/workspace/${workspaceId}`)
    }

  }

  return (

    <aside className="w-80 border-r border-violet-100 bg-white/95 flex flex-col">

      <div className="px-6 py-4 border-b border-violet-100">
        <h2 className="title-font font-semibold text-xl text-violet-900">
          Documents
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">

        {documents.map((doc: Document) => {

          const active = String(doc.id) === docId

          return (

            <div
              key={doc.id}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer border transition ${
                active
                  ? "bg-pink-50 border-pink-200 text-violet-900"
                  : "border-violet-100 hover:bg-violet-50"
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
                onRename={(newTitle: string) => renameDoc(doc.id, newTitle)}
                onDelete={() => removeDoc(doc.id)}
              />

            </div>

          )

        })}

      </div>

      <div className="border-t border-violet-100 p-4">

        <input
          className="input mb-3"
          placeholder="New document..."
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
        />

        <button
          onClick={handleCreate}
          className="btn-primary w-full"
        >
          Create
        </button>

      </div>

    </aside>

  )

}
