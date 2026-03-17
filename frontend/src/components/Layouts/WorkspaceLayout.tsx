import { Outlet, useParams } from "react-router-dom"
import DocumentsSidebar from "../DocumentsSidebar"
import WorkspaceHeader from "../WorkspaceHeader"

export default function WorkspaceLayout() {

  const { id } = useParams<{ id: string }>()

  if (!id) return null

  return (

    <div className="flex h-full">

      <DocumentsSidebar workspaceId={id} />

      <div className="flex flex-col flex-1 bg-white/40">

        <WorkspaceHeader />

        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </div>

      </div>

    </div>

  )

}
