import { Outlet, useLocation, useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import DocumentsSidebar from "../DocumentsSidebar"
import WorkspaceHeader from "../WorkspaceHeader"

export default function WorkspaceLayout() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!contentRef.current) {
      return
    }

    contentRef.current.scrollTo({ top: 0, behavior: "auto" })
  }, [location.pathname])

  if (!id) return null

  return (
    <div className="flex min-h-[calc(100vh-80px)] overflow-hidden bg-[#fefdf1]">
      <DocumentsSidebar workspaceId={id} className="hidden lg:flex" />

      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close documents sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 bg-[#373830]/20 backdrop-blur-[1px]"
          />
          <DocumentsSidebar
            workspaceId={id}
            className="relative z-10 h-full w-[88vw] max-w-sm shadow-[0px_20px_40px_rgba(55,56,48,0.16)]"
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <WorkspaceHeader
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />
        <div ref={contentRef} className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
