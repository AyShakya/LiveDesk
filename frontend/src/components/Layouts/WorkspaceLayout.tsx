import { Outlet, useParams } from "react-router-dom"
import DocumentsSidebar from "../DocumentsSidebar"
import WorkspaceHeader from "../WorkspaceHeader"


export default function WorkspaceLayout() {

  const { id } = useParams<{ id: string }>()

  if (!id) return null

  return (

    <div className="flex h-full">

      {/* Documents sidebar */}

      <DocumentsSidebar workspaceId={id} />


      {/* Main workspace area */}

      <div className="flex flex-col flex-1">

        {/* Header */}

        <WorkspaceHeader />

        {/* Page content */}

        <div className="flex-1 p-8 overflow-auto">

          <Outlet />

        </div>

      </div>

    </div>

  )

}