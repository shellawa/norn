import { redirect, type RequestHandler } from "@sveltejs/kit"
import { AUTH_COOKIE_NAME, clearAuthCookie, deleteSession } from "$lib/server/auth"

export const GET: RequestHandler = async ({ cookies, url }) => {
  const token = cookies.get(AUTH_COOKIE_NAME)
  if (token) {
    deleteSession(token)
  }

  clearAuthCookie(cookies, url.protocol === "https:")
  throw redirect(303, "/auth/login")
}
