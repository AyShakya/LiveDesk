import { Link } from "react-router-dom"

export default function ComingSoon() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-4 fade-up">
      <div className="glass-card text-center p-12 max-w-lg w-full">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#f0efe4] text-4xl shadow-sm floaty">
          🚀
        </div>
        <h1 className="title-font text-5xl font-bold mb-4 text-[#373830]">Coming Soon</h1>
        <p className="text-lg text-[#66695e] mb-8">
          We're working hard to bring you this feature. Stay tuned for updates!
        </p>
        <Link to="/workspaces" className="btn-primary px-10 py-4">
          Back to Workspaces
        </Link>
      </div>
    </div>
  )
}
