import { produce } from "sveltekit-sse"
import { mcServer } from "$lib/server/minecraft"
import { type RequestHandler } from "@sveltejs/kit"

export const POST: RequestHandler = async () => {
  return produce(async ({ emit }) => {
    const logHandler = (text: string) => emit("log", text)
    const statusHandler = (status: string) => emit("status", status)

    mcServer.on("log", logHandler)
    mcServer.on("status", statusHandler)
  })
}
