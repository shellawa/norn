import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getSafeRedirect } from "$lib/server/auth"

const errorMessages: Record<string, string> = {
  invalid_credentials: "Invalid username or password.",
  setup_required: "Create the admin account first.",
  already_authenticated: "You are already signed in."
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user) {
    throw redirect(303, "/")
  }

  if (!locals.setupComplete) {
    throw redirect(303, `/auth/setup${url.search}`)
  }

  return {
    redirectTo: getSafeRedirect(url.searchParams.get("redirectTo")),
    errorMessage: errorMessages[url.searchParams.get("error") ?? ""] ?? ""
  }
}
