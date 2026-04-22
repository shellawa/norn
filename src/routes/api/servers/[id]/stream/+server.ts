import { produce } from "sveltekit-sse"
import { type RequestHandler } from "@sveltejs/kit"
import { minecraftServerManager } from "$lib/server/minecraft-server-manager"

export const POST: RequestHandler = async ({ params }) => {
  const serverId = params.id
  if (!serverId) {
    return new Response("Missing server id", { status: 400 })
  }

  const server = minecraftServerManager.getServerInstance(serverId)

  if (!server) {
    return new Response(`Unknown server: ${serverId}`, { status: 404 })
  }

  return produce(async ({ emit }) => {
    const logHandler = (text: string) => emit("log", text)
    const statusHandler = (status: string) => emit("status", status)

    server.on("log", logHandler)
    server.on("status", statusHandler)

    return () => {
      server.off("log", logHandler)
      server.off("status", statusHandler)
    }
  })
}
