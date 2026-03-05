import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

export default function Layout() {

  const { user, logout } = useAuth()

  return (

    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}

      <aside className="w-64 bg-white border-r flex flex-col">

        <div className="px-6 py-4 border-b">
          <Link to="/workspaces" className="text-xl font-semibold">
            LiveDesk
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">

          <Link
            to="/workspaces"
            className="block px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Workspaces
          </Link>

        </nav>

        <div className="border-t p-4 text-sm">

          <div className="text-gray-600 mb-2">
            {user?.email}
          </div>

          <button
            onClick={logout}
            className="text-red-500 hover:text-red-600"
          >
            Logout
          </button>

        </div>

      </aside>


      {/* Main content */}

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

    </div>

  )

}