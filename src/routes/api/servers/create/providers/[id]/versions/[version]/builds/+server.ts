import { json, type RequestHandler } from "@sveltejs/kit"
import { getProvider } from "$lib/server/providers/registry"

export const GET: RequestHandler = async ({ params }) => {
  if (!params.id || !params.version) {
    return json({ error: "Missing provider id or version" }, { status: 400 })
  }

  const provider = getProvider(params.id)
  if (!provider) {
    return json({ error: `Unknown provider: ${params.id}` }, { status: 404 })
  }

  return json(await provider.getBuilds(params.version))
}
