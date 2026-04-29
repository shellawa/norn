import type { LayoutServerLoad } from "./$types"
import type { McServerState } from "$lib/types"

export const load: LayoutServerLoad = async ({ fetch, locals }) => {
  if (!locals.user) {
    return { user: null, servers: [] as McServerState[] }
  }

  const res = await fetch("/api/servers")
  const servers = (await res.json()) as McServerState[]

  return { user: locals.user, servers }
}
