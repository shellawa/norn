import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(303, "/")
  }

  throw redirect(303, locals.setupComplete ? "/auth/login" : "/auth/setup")
}
