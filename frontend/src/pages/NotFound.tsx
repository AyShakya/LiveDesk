import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="glass-card text-center p-10 max-w-md w-full">
        <h1 className="title-font text-5xl font-bold mb-2">404</h1>
        <p className="text-slate-300 mb-6">Page not found</p>
        <Link to="/" className="btn-primary inline-block">Go home</Link>
      </div>
    </div>
  )
}
