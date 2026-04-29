import { json, type RequestHandler } from "@sveltejs/kit"
import { getProvider } from "$lib/server/providers/registry"

export const GET: RequestHandler = async ({ params }) => {
  if (!params.id) {
    return json({ error: "Missing provider id" }, { status: 400 })
  }

  const provider = getProvider(params.id)
  if (!provider) {
    return json({ error: `Unknown provider: ${params.id}` }, { status: 404 })
  }

  return json(await provider.getVersions())
}
