import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getSafeRedirect } from "$lib/server/auth"

const errorMessages: Record<string, string> = {
  already_setup: "The admin account already exists.",
  password_mismatch: "Passwords do not match.",
  invalid_username: "Username must be 3-32 characters and only use letters, numbers, dots, underscores, or dashes.",
  weak_password: "Password must be at least 8 characters long."
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) {
    throw redirect(303, "/")
  }

  if (locals.setupComplete) {
    throw redirect(303, `/auth/login${url.search}`)
  }

  return {
    redirectTo: getSafeRedirect(url.searchParams.get("redirectTo")),
    errorMessage: errorMessages[url.searchParams.get("error") ?? ""] ?? ""
  }
}
