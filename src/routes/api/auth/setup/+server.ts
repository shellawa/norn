import { redirect, type RequestHandler } from "@sveltejs/kit"
import { createSession, createUser, getSafeRedirect, setAuthCookie } from "$lib/server/auth"

const buildErrorRedirect = (redirectTo: string, code: string) => {
  const params = new URLSearchParams({ error: code })
  if (redirectTo) params.set("redirectTo", redirectTo)
  return `/auth/setup?${params.toString()}`
}

export const POST: RequestHandler = async ({ request, cookies, locals, url }) => {
  if (locals.setupComplete) {
    throw redirect(303, `/auth/login?${new URLSearchParams({ error: "already_setup" }).toString()}`)
  }

  if (locals.user) {
    throw redirect(303, "/")
  }

  const formData = await request.formData()
  const username = String(formData.get("username") ?? "")
  const password = String(formData.get("password") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") ?? "") || url.searchParams.get("redirectTo"))

  if (password !== confirmPassword) {
    throw redirect(303, buildErrorRedirect(redirectTo, "password_mismatch"))
  }

  try {
    const user = createUser(username, password)
    const session = createSession(user.id)
    setAuthCookie(cookies, session.token, session.expiresAt, url.protocol === "https:")
    throw redirect(303, redirectTo)
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("Username must be")) {
      throw redirect(303, buildErrorRedirect(redirectTo, "invalid_username"))
    }
    if (message.includes("Password must be")) {
      throw redirect(303, buildErrorRedirect(redirectTo, "weak_password"))
    }
    if (message.includes("admin account already exists")) {
      throw redirect(303, `/auth/login?${new URLSearchParams({ error: "already_setup" }).toString()}`)
    }
    throw error
  }
}
