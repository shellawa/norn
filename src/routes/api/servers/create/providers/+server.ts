import { json, type RequestHandler } from "@sveltejs/kit"
import { providers } from "$lib/server/providers/registry"

export const GET: RequestHandler = () => {
  return json(
    providers.map((provider) => ({
      id: provider.id,
      name: provider.name
    }))
  )
}
