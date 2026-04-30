export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.json()
}

export function guessJavaVersion(mcVersion: string, type: string): number {
  if (type === "old_alpha" || type === "old_beta") return 8

  const parts = mcVersion.split(".").map(Number)
  const major = parts[0]

  if (major >= 26) return 25
  if (major !== 1) return 25

  const minor = parts[1] ?? 0
  const patch = parts[2] ?? 0

  if (minor >= 21) return 21
  if (minor >= 20) return patch >= 5 ? 21 : 17
  if (minor >= 17) return 17
  if (minor >= 12) return 11
  return 8
}
