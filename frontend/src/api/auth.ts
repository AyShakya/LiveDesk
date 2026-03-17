import http from "./http.ts"
import type { AuthResponse } from "../types/auth.ts"

export async function login(email: string, password: string) {
  const res = await http.post("/auth/login", { email, password })
  return res.data as AuthResponse
}

export async function register(name: string, email: string, password: string) {
  const res = await http.post("/auth/register", { name, email, password })
  return res.data as AuthResponse
}

export async function getMe() {
  const res = await http.get("/auth/me")
  return res.data as AuthResponse
}