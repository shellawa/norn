import type { McServerStatus } from "$lib/types.js"

export const load = async ({ fetch }) => {
  const res = await fetch("/api/server")
  const data = (await res.json()) as { status: McServerStatus; history: string[] }

  return data
}
