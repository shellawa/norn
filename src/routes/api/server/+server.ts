import { json, type RequestHandler } from "@sveltejs/kit"
import { mcServer } from "$lib/server/minecraft"

export const POST: RequestHandler = async ({ request }) => {
  const { command } = await request.json()

  if (command === "START") {
    mcServer.start()
    return json({ status: "ok" })
  }

  if (command === "STOP") {
    mcServer.stop()
    return json({ status: "ok" })
  }

  return json({ error: "Unknown command" }, { status: 400 })
}

export const GET: RequestHandler = async () => {
  return json({ status: mcServer.getStatus(), history: mcServer.getLogsHistory() })
}
