import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import type { FileItem } from "$lib/types"

export const load: PageServerLoad = async ({ fetch, params }) => {
  const serverId = params.id
  if (!serverId) error(400)

  const res = await fetch(`/api/servers/${serverId}/file${params.path ? "/" + params.path : ""}`)
  const fileItems = (await res.json()) as FileItem[]

  return { fileItems }
}
