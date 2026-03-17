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

    <div className="min-h-screen flex items-center justify-center bg-gray-50">

      <form
        className="bg-white p-8 rounded-xl shadow-md w-[400px]"
        onSubmit={(e) => {
          e.preventDefault()
          handleRegister()
        }}
      >

        <h1 className="text-2xl font-semibold mb-6">
          Register
        </h1>

        {error && (
          <div className="text-red-500 text-sm mb-4">
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

        <div className="text-sm text-gray-500 mt-4">

          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600"
          >
            Login
          </Link>

        </div>

      </form>

    </div>

  )

}
