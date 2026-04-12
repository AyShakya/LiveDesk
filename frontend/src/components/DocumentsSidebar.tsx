import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getWorkspaceDocuments, createDocument } from "../api/documents"
import DocumentMenu from "./DocumentMenu"
import type { Document } from "../types/document"
import { SidebarSkeleton } from "./ui/Skeleton"

interface Props {
  workspaceId: string
  className?: string
  onNavigate?: () => void
}

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ")
}

export default function DocumentsSidebar({ workspaceId, className, onNavigate }: Props) {
  const navigate = useNavigate()
  const { docId } = useParams<{ docId?: string }>()

  const [documents, setDocuments] = useState<Document[]>([])
  const [title, setTitle] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    void load(true)
  }, [workspaceId])

  async function load(showLoader = false): Promise<void> {
    if (showLoader) {
      setLoading(true)
    }

    try {
      const data: Document[] = await getWorkspaceDocuments(workspaceId)
      setDocuments(data)
    } catch (err) {
      console.error("Failed to load documents", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(): Promise<void> {
    if (!title.trim() || creating) return

    setCreating(true)

    try {
      const doc: Document = await createDocument(workspaceId, title)
      setTitle("")
      navigate(`/workspace/${workspaceId}/document/${doc.id}`)
      await load()
    } catch (err) {
      console.error("Failed to create document", err)
    } finally {
      setCreating(false)
    }
  }

  function renameDoc(id: string, newTitle: string): void {
    setDocuments((prev: Document[]) =>
      prev.map((d: Document) =>
        d.id === id ? { ...d, title: newTitle } : d,
      ),
    )
  }

  function removeDoc(id: string): void {
    setDocuments((prev: Document[]) => prev.filter((d: Document) => d.id !== id))

    if (docId && String(id) === docId) {
      navigate(`/workspace/${workspaceId}`)
    }
  }

  if (loading) {
    return <SidebarSkeleton className={className} />
  }

  return (
    <aside
      className={cx(
        "flex w-80 shrink-0 flex-col bg-[#fbfaed]",
        className,
      )}
    >
      <div className="px-5 py-5">
        <h2 className="title-font text-3xl font-bold text-[#373830]">
          Documents
        </h2>
      </div>

      <div className="flex-1 space-y-2 overflow-auto px-3 pb-3">
        {documents.length === 0 && (
          <div className="rounded-3xl bg-[#f4f3e8] p-4 text-sm text-[#66695e]">
            No documents yet. Create your first document to start collaborating.
          </div>
        )}

        {documents.map((doc: Document) => {
          const active = String(doc.id) === docId

          return (
            <div
              key={doc.id}
              className={`flex items-center justify-between rounded-2xl px-3 py-2.5 transition ${
                active
                  ? "bg-gradient-to-r from-[#6236ff] to-[#7f5bff] text-white"
                  : "bg-[#f4f3e8] text-[#373830] hover:bg-[#eeede1]"
              }`}
            >
              <div
                onClick={() => {
                  navigate(`/workspace/${workspaceId}/document/${doc.id}`)
                  onNavigate?.()
                }}
                className="flex-1 cursor-pointer truncate"
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

      <div className="bg-[#fbfaed] p-4">
        <input
          className="input mb-3"
          placeholder="New document..."
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        />

        <button onClick={handleCreate} className="btn-primary w-full" disabled={creating}>
          {creating ? "Creating..." : "Create"}
        </button>
      </div>
    </aside>
  )
}
