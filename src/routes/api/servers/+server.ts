import { json, type RequestHandler } from "@sveltejs/kit"
import { minecraftServerManager } from "$lib/server/minecraft-server-manager"

export const GET: RequestHandler = async () => {
  return json(minecraftServerManager.listServers())
}
