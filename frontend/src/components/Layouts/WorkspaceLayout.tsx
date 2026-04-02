import { Outlet, useParams } from "react-router-dom"
import { useState } from "react"
import DocumentsSidebar from "../DocumentsSidebar"
import WorkspaceHeader from "../WorkspaceHeader"

export default function WorkspaceLayout() {
  const { id } = useParams<{ id: string }>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  if (!id) return null

  return (
    <div className="relative flex h-full">
      <button
        type="button"
        aria-label={isSidebarOpen ? "Collapse documents sidebar" : "Open documents sidebar"}
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="absolute left-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-white/95 text-xl text-violet-700 shadow-sm transition hover:bg-violet-50"
      >
        ☰
      </button>

      {isSidebarOpen && <DocumentsSidebar workspaceId={id} />}

      <div className="flex flex-1 flex-col bg-white/40">
        <WorkspaceHeader />
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
