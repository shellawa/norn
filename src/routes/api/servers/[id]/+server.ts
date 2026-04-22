import { json, type RequestHandler } from "@sveltejs/kit"
import { minecraftServerManager } from "$lib/server/minecraft-server-manager"

export const GET: RequestHandler = async ({ params }) => {
  const serverId = params.id
  if (!serverId) {
    return json({ error: "Missing server id" }, { status: 400 })
  }

  const serverState = minecraftServerManager.getServerState(serverId)
  if (!serverState) {
    return json({ error: `Unknown server: ${serverId}` }, { status: 404 })
  }

  return json(serverState)
}
