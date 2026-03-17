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

    }

    setLoading(false)

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <form
        className="bg-white p-8 rounded-xl shadow-md w-[400px]"
        onSubmit={(e) => {
          e.preventDefault()
          handleLogin()
        }}
      >

        <h1 className="text-2xl font-semibold mb-6">
          Login
        </h1>

        {error && (
          <div className="text-red-500 text-sm mb-4">
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

        <div className="text-sm text-gray-500 mt-4">

          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600"
          >
            Register
          </Link>

        </div>

      </form>

    </div>

  )

}
