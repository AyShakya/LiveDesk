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

    <div className="min-h-screen bg-[#fefdf1] px-4 py-10 lg:px-10">
      <div className="mx-auto grid min-h-[86vh] max-w-[1400px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="px-2 lg:px-8">
          <h1 className="title-font mb-6 text-7xl font-extrabold tracking-[-0.02em] text-[#373830]">
            The space for <span className="italic text-[#6236ff]">fluid</span> collaboration.
          </h1>
          <p className="max-w-xl text-3xl leading-relaxed text-[#616458]">
            A digital curator for your most ambitious projects. Join thousands of creators building in real-time.
          </p>
        </section>

        <form
          className="glass-card mx-auto w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 fade-up"
          onSubmit={(e) => {
            e.preventDefault()
            handleLogin()
          }}
        >

          <h1 className="title-font mb-2 text-5xl font-bold text-[#373830]">
            Welcome back
          </h1>

          <p className="text-lg text-[#616458] mb-6">Sign in to your workspace to continue creating.</p>

          {error && (
            <div className="rounded-2xl bg-[#ffd9d7] px-3 py-2 text-sm text-[#8a2d2b] mb-4">
              {error}
            </div>
          )}

          <input
            className="input mb-3"
            placeholder="alex@livedesk.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            className="input mb-4"
            placeholder="••••••••"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="btn-primary w-full text-xl"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Sign In to LiveDesk"}
          </button>

          <div className="text-base text-[#616458] mt-5 text-center">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-[#6236ff] hover:opacity-80">
              Create an account
            </Link>
          </div>

        </form>
      </div>
    </div>

  )

}
