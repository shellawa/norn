import { minecraftServerManager } from "$lib/server/minecraft-server-manager"
import { json, type RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async ({ request, params }) => {
  const serverId = params.id
  if (!serverId) return json({ error: "Missing server id" }, { status: 400 })

  const instance = minecraftServerManager.getServerInstance(serverId)
  if (!instance) {
    return json({ error: `Unknown server: ${serverId}` }, { status: 404 })
  }

  try {
    const { cmd }: { cmd: string } = await request.json()
    instance.sendCommand(cmd)
    return json({ status: "ok" })
  } catch (e) {
    if (e instanceof SyntaxError) return json({ error: "Invalid form data" }, { status: 400 })
    return json({ error: "???" }, { status: 500 })
  }
}
