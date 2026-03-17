import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center">
      <div className="glass-card max-w-3xl w-full p-12">
        <p className="text-fuchsia-200 tracking-[0.25em] uppercase text-xs mb-4">Funky. Premium. Collaborative.</p>
        <h1 className="title-font text-5xl md:text-6xl font-bold mb-5 bg-gradient-to-r from-fuchsia-200 via-violet-100 to-cyan-200 bg-clip-text text-transparent">
          LiveDesk
        </h1>

        <p className="text-slate-300 max-w-2xl mx-auto mb-8 leading-7">
          A vibrant real-time collaborative desk for teams that love speed, style, and seamless writing.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="btn-primary px-8 py-3"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="btn-secondary px-8 py-3"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}
