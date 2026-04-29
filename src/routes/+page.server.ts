import type { PageServerLoad } from "./$types"
import type { McServerState } from "$lib/types"

export const load: PageServerLoad = async ({ fetch }) => {
  const serverRes = await fetch("/api/servers")
  const servers = (await serverRes.json()) as McServerState[]

  const providerRes = await fetch("/api/servers/create/providers")
  const providers = (await providerRes.json()) as { id: string; name: string }[]

  return { servers, providers }
}
