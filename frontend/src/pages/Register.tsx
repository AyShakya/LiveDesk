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

    <div className="min-h-screen bg-[#fefdf1] grid place-items-center px-4 py-8">

      <form
        className="glass-card p-8 w-[520px] max-w-full rounded-[2.5rem] fade-up"
        onSubmit={(e) => {
          e.preventDefault()
          handleRegister()
        }}
      >

        <h1 className="title-font text-5xl font-bold mb-2 text-[#373830]">
          Create account
        </h1>

        <p className="text-[#616458] text-lg mb-6">Start collaborating in seconds.</p>

        {error && (
          <div className="text-[#8a2d2b] bg-[#ffd9d7] rounded-2xl px-3 py-2 text-sm mb-4">
            {error}
          </div>
        )}

        <input
          className="input mb-3"
          placeholder="Your name"
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
          className="btn-primary w-full text-xl"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Start creating for free"}
        </button>

        <div className="text-base text-[#616458] mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#6236ff] hover:opacity-80">
            Login
          </Link>
        </div>

      </form>

    </div>

  )

}
