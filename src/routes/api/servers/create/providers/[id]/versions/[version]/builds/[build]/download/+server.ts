import { json, type RequestHandler } from "@sveltejs/kit"
import { getProvider } from "$lib/server/providers/registry"

export const GET: RequestHandler = async ({ params }) => {
  if (!params.id || !params.version || !params.build) {
    return json({ error: "Missing provider id, version, or build" }, { status: 400 })
  }

  const provider = getProvider(params.id)
  if (!provider) {
    return json({ error: `Unknown provider: ${params.id}` }, { status: 404 })
  }

  const url = await provider.getDownloadUrl(params.version, params.build)

  return json({ url })
}
