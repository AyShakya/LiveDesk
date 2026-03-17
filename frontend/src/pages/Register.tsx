import { useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { useNavigate, Link } from "react-router-dom"

export default function Register() {

  const { register } = useAuth()
  const navigate = useNavigate()

  const [name,setName] = useState("")
  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error,setError] = useState("")

  async function handleRegister() {

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email and password are required")
      return
    }

    setLoading(true)
    setError("")

    try {

      await register(name,email,password)
      navigate("/workspaces")

    } catch {

      setError("Registration failed")

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="min-h-screen grid place-items-center px-4">

      <form
        className="glass-card p-8 w-[420px] max-w-full fade-up"
        onSubmit={(e) => {
          e.preventDefault()
          handleRegister()
        }}
      >

        <h1 className="title-font text-3xl font-semibold mb-2 text-violet-900">
          Create account
        </h1>

        <p className="text-violet-700 text-sm mb-6">Start collaborating in seconds.</p>

        {error && (
          <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-sm mb-4">
            {error}
          </div>
        )}

        <input
          className="input mb-3"
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

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
          {loading ? "Creating account..." : "Register"}
        </button>

        <div className="text-sm text-violet-700 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-pink-500 hover:text-violet-700">
            Login
          </Link>
        </div>

      </form>

    </div>

  )

}
