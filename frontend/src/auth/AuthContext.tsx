import { createContext, useContext, useEffect, useState } from "react"
import * as authApi from "../api/auth.ts"
import type { User } from "../types/auth.ts"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [])

  async function init() {

    const token = localStorage.getItem("token")

    if (!token) {
      setLoading(false)
      return
    }

    try {

      const me = await authApi.getMe()

      setUser(me)

    } catch {

      localStorage.removeItem("token")

    } finally {

      setLoading(false)

    }

  }

  async function login(email: string, password: string) {

    const res = await authApi.login(email, password)

    localStorage.setItem("token", res.token)

    setUser(res.user)

  }

  async function register(name: string, email: string, password: string) {

    const res = await authApi.register(name, email, password)

    localStorage.setItem("token", res.token)

    setUser(res.user)

  }

  function logout() {

    localStorage.removeItem("token")

    setUser(null)

  }

  return (

    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >

      {children}

    </AuthContext.Provider>

  )

}

export function useAuth() {

  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return ctx

}
