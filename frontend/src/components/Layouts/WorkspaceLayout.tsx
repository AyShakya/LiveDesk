import { Outlet, useParams } from "react-router-dom"
import DocumentsSidebar from "../DocumentsSidebar"

export default function WorkspaceLayout() {

  const { id } = useParams<{ id: string }>()

  return (
    <div className="flex h-full">

      {/* Documents Sidebar */}
      <DocumentsSidebar workspaceId={id!} />

      {/* Workspace Content */}
      <div className="flex-1 p-10 overflow-auto">
        <Outlet />
      </div>

    </div>
  )
}