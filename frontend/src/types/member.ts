export interface Member {
  id: number
  email: string
  name: string
  role: "admin" | "member"
}