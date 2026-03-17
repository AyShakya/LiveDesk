import { createContext, useContext, useEffect, useState } from "react"
import * as authApi from "../api/auth.ts"
import type { User } from "../types/auth.ts"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    init()
  }, [])

  async function init() {

    const token = localStorage.getItem("token")

    if (!token) return

    try {

      const me = await authApi.getMe()

      setUser(me.user)

    } catch {

      localStorage.removeItem("token")

    }

  }

  async function login(email: string, password: string) {

    const res = await authApi.login(email, password)

    localStorage.setItem("token", res.token)

    const me = await authApi.getMe()

    setUser(me.user)

  }

  async function register(name: string, email: string, password: string) {

    const res = await authApi.register(name, email, password)

    localStorage.setItem("token", res.token)

    const me = await authApi.getMe()

    setUser(me.user)

  }

  function logout() {

    localStorage.removeItem("token")

    setUser(null)

  }

  return (

    <AuthContext.Provider
      value={{ user, login, register, logout }}
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