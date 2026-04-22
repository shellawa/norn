import type { LayoutServerLoad } from "./$types"
import type { McServerState } from "$lib/types"

export const load: LayoutServerLoad = async ({ fetch }) => {
  const res = await fetch("/api/servers")
  const servers = (await res.json()) as McServerState[]

  return { servers }
}
