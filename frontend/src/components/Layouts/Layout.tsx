import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

export default function Layout() {

  const { user, logout } = useAuth()

  return (

    <div className="flex min-h-screen">

      <aside className="w-72 border-r border-violet-100 bg-white/95 flex flex-col">

        <div className="px-6 py-6 border-b border-violet-100">
          <Link to="/workspaces" className="title-font text-2xl font-bold tracking-tight text-violet-900">
            LiveDesk
          </Link>
          <p className="text-xs text-violet-500 mt-1">Your smooth collaboration space</p>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2">
          <Link
            to="/workspaces"
            className="block px-3 py-2.5 rounded-xl bg-violet-50 border border-transparent hover:border-pink-200 hover:bg-pink-50 transition"
          >
            Workspaces
          </Link>
        </nav>

        <div className="border-t border-violet-100 p-4 text-sm">
          <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 mb-3">
            <div className="text-violet-500 text-xs mb-1">Signed in as</div>
            <div className="text-violet-900 truncate">{user?.email}</div>
          </div>

          <button
            onClick={logout}
            className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
          >
            Logout
          </button>
        </div>

      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

    </div>

  )

}
