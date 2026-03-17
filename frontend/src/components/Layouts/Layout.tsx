import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

export default function Layout() {

  const { user, logout } = useAuth()

  return (

    <div className="flex min-h-screen">

      <aside className="w-72 border-r border-white/10 bg-slate-950/55 backdrop-blur-xl flex flex-col">

        <div className="px-6 py-6 border-b border-white/10">
          <Link to="/workspaces" className="title-font text-2xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
            LiveDesk
          </Link>
          <p className="text-xs text-slate-400 mt-1">Real-time collaboration, reimagined</p>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2">
          <Link
            to="/workspaces"
            className="block px-3 py-2.5 rounded-xl bg-white/5 border border-transparent hover:border-fuchsia-300/20 hover:bg-fuchsia-500/10 transition"
          >
            Workspaces
          </Link>
        </nav>

        <div className="border-t border-white/10 p-4 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 mb-3">
            <div className="text-slate-400 text-xs mb-1">Signed in as</div>
            <div className="text-slate-200 truncate">{user?.email}</div>
          </div>

          <button
            onClick={logout}
            className="w-full rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-rose-200 hover:bg-rose-500/25"
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
