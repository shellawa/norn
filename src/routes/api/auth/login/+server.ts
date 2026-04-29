import { redirect, type RequestHandler } from "@sveltejs/kit"
import { authenticateUser, createSession, getSafeRedirect, setAuthCookie } from "$lib/server/auth"

const buildErrorRedirect = (redirectTo: string, code: string) => {
  const params = new URLSearchParams({ error: code })
  if (redirectTo) params.set("redirectTo", redirectTo)
  return `/auth/login?${params.toString()}`
}

export const POST: RequestHandler = async ({ request, cookies, locals, url }) => {
  if (!locals.setupComplete) {
    throw redirect(303, `/auth/setup?${new URLSearchParams({ error: "setup_required" }).toString()}`)
  }

  if (locals.user) {
    throw redirect(303, "/")
  }

  const formData = await request.formData()
  const username = String(formData.get("username") ?? "")
  const password = String(formData.get("password") ?? "")
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") ?? "") || url.searchParams.get("redirectTo"))

  const user = authenticateUser(username, password)
  if (!user) {
    throw redirect(303, buildErrorRedirect(redirectTo, "invalid_credentials"))
  }

  const session = createSession(user.id)
  setAuthCookie(cookies, session.token, session.expiresAt, url.protocol === "https:")
  throw redirect(303, redirectTo)
}
