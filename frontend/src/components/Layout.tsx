import { Link } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link
          to="/workspaces"
          className="text-xl font-semibold text-gray-800"
        >
          LiveDesk
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/workspaces"
            className="text-gray-600 hover:text-black"
          >
            Workspaces
          </Link>

          {user && (
            <>
              <span className="text-gray-600 text-sm">
                {user.email}
              </span>

              <button
                onClick={logout}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}