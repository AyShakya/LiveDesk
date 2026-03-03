import { createContext, useContext, useEffect, useState } from "react"
import http from "../api/http"
import type { AuthResponse, User } from "../types/auth"

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initialize() {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await http.get<User>("/me")
        setUser(res.data)
      } catch (error) {
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  async function login(email: string, password: string) {
    const res = await http.post<AuthResponse>("/login", {
      email,
      password,
    })

    localStorage.setItem("token", res.data.token)
    setUser(res.data.user)
  }

  function logout() {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}