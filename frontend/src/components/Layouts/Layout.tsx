import { Link, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../auth/AuthContext"

export default function Layout() {
  const { logout } = useAuth()
  const location = useLocation()

  const isWorkspaceRoute =
    location.pathname.startsWith("/workspaces") ||
    location.pathname.startsWith("/workspace/")

  return (
    <div className="min-h-screen bg-[#fefdf1] text-[#373830]">
      <header className="sticky top-0 z-40 border-b border-[#ecebdd] bg-[#fefdf1]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-8">
            <Link to="/workspaces" className="title-font text-4xl font-extrabold italic text-[#6236ff]">
              LiveDesk
            </Link>

            <nav className="hidden items-center gap-7 text-[1.05rem] font-semibold md:flex">
              <Link
                to="/workspaces"
                className={`pb-1 ${isWorkspaceRoute ? "text-[#6236ff] border-b-2 border-[#6236ff]" : "text-[#66695e]"}`}
              >
                Workspaces
              </Link>
              <span className="text-[#66695e]">Templates</span>
              <span className="text-[#66695e]">Resources</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn-primary px-8 py-3">Create New</button>
            <button
              onClick={logout}
              className="rounded-full bg-[#f0efe4] px-5 py-3 text-sm font-semibold text-[#373830] transition hover:bg-[#e8e6d8]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px]">
        <Outlet />
      </main>
    </div>
  )
}
