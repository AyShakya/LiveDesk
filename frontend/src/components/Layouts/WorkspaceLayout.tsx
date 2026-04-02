import { Outlet, useParams } from "react-router-dom"
import { useState } from "react"
import DocumentsSidebar from "../DocumentsSidebar"
import WorkspaceHeader from "../WorkspaceHeader"

export default function WorkspaceLayout() {
  const { id } = useParams<{ id: string }>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  if (!id) return null

  return (
    <div className="flex h-full min-h-screen overflow-hidden bg-gradient-to-br from-violet-50/50 via-white to-pink-50/40">
      <DocumentsSidebar workspaceId={id} className="hidden lg:flex" />

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close documents sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-violet-950/35 backdrop-blur-[1px]"
          />
          <DocumentsSidebar
            workspaceId={id}
            className="relative z-10 h-full w-[88vw] max-w-sm shadow-2xl"
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <WorkspaceHeader
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
