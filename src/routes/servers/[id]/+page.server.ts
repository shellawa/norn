import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import type { McServerState } from "$lib/types"

export const load: PageServerLoad = async ({ fetch, params }) => {
  const res = await fetch(`/api/servers/${encodeURIComponent(params.id)}`)
  if (res.status != 200) error(res.status)

  const data = (await res.json()) as McServerState
  return { serverState: { info: data.info, status: data.status, logs: data.logs } }
}
