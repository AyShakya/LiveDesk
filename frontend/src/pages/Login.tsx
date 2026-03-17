import { useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { useNavigate, Link } from "react-router-dom"

export default function Login() {

  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin() {

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    setError("")

    try {

      await login(email, password)
      navigate("/workspaces")

    } catch {

      setError("Invalid credentials")

    } finally {
      setLoading(false)
    }

  }

  return (

    <div className="min-h-screen grid place-items-center px-4">

      <form
        className="glass-card w-full max-w-md p-8"
        onSubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}
      >

        <h1 className="title-font text-3xl font-semibold mb-2 text-white">
          Welcome back
        </h1>

        <p className="text-slate-300 text-sm mb-6">Sign in to continue to your workspace.</p>

        {error && (
          <div className="text-rose-200 bg-rose-500/20 border border-rose-300/40 rounded-xl px-3 py-2 text-sm mb-4">
            {error}
          </div>
        )}

        <input
          className="input mb-3"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          className="input mb-4"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-sm text-slate-300 mt-4">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-fuchsia-200 hover:text-cyan-200">
            Register
          </Link>
        </div>

      </form>

    </div>

  )

}
