import "server-only"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DEMO_USERS } from "./constants"
import type { Role, Session } from "./types"

// Demo-only "login": the role is kept in a plain cookie. A real deployment
// needs proper authentication, signed sessions and access logging.
export const SESSION_COOKIE = "xray_role"

export async function getSession(): Promise<Session | null> {
  const role = (await cookies()).get(SESSION_COOKIE)?.value
  if (role === "admin" || role === "radiologist") return DEMO_USERS[role]
  return null
}

export async function requireSession(...roles: Role[]): Promise<Session> {
  const session = await getSession()
  if (!session) redirect("/")
  if (roles.length && !roles.includes(session.role)) redirect("/dashboard")
  return session
}
