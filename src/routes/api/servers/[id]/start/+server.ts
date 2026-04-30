import { minecraftServerManager } from "$lib/server/minecraft-server-manager"
import { json, type RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ params }) => {
  const serverId = params.id
  if (!serverId) return json({ error: "Missing server id" }, { status: 400 })

  const instance = minecraftServerManager.getServerInstance(serverId)
  if (!instance) {
    return json({ error: `Unknown server: ${serverId}` }, { status: 404 })
  }

  await instance.start()
  return json({ status: "ok" })
}
