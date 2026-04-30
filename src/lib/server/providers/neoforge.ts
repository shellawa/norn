import type { ServerProvider, Version } from "./types"
import { guessJavaVersion } from "./utils"

const BASE = "https://maven.neoforged.net/releases/net/neoforged/neoforge"

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.text()
}

function extractAll(xml: string, tag: string): string[] {
  return [...xml.matchAll(new RegExp(`<${tag}>([^<]+)</${tag}>`, "g"))].map((m) => m[1])
}

function cleanVersion(v: string): string {
  return v.split("-")[0].split("+")[0]
}

function toNum(v: string): number | null {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function mapNeoForgeToMc(version: string): string | null {
  const clean = cleanVersion(version)
  const parts = clean.split(".")

  const major = toNum(parts[0])
  const minor = toNum(parts[1])
  const patch = toNum(parts[2] ?? "0")

  if (major === null || minor === null || patch === null) return null

  if (major >= 26) {
    return patch === 0 ? `${major}.${minor}` : `${major}.${minor}.${patch}`
  }

  return `1.${major}.${minor}`
}

function sortVersionsDesc(a: string, b: string): number {
  const pa = a.split(".").map(Number)
  const pb = b.split(".").map(Number)

  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pb[i] ?? 0) - (pa[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

export class NeoForgeProvider implements ServerProvider {
  readonly id = "neoforge"
  readonly name = "NeoForge"

  private async getAllVersions(): Promise<string[]> {
    const xml = await fetchText(`${BASE}/maven-metadata.xml`)
    return extractAll(xml, "version")
  }

  async getVersions(): Promise<Version[]> {
    const versions = await this.getAllVersions()

    const map = new Map<string, Version>()

    for (const v of versions) {
      const mc = mapNeoForgeToMc(v)
      if (!mc) continue

      if (!map.has(mc)) {
        map.set(mc, {
          id: mc,
          type: "release",
          javaVersion: guessJavaVersion(mc, "release")
        })
      }
    }

    return [...map.values()].sort((a, b) => sortVersionsDesc(a.id, b.id))
  }

  async getBuilds(version: string): Promise<string[]> {
    const all = await this.getAllVersions()

    return all
      .filter((v) => mapNeoForgeToMc(v) === version)
      .sort((a, b) => sortVersionsDesc(cleanVersion(a), cleanVersion(b)))
  }

  async getDownloadUrl(version: string, build: string): Promise<[string, string][]> {
    return [
      ["https://github.com/neoforged/ServerStarterJar/releases/download/0.1.34/server.jar", "server.jar"],
      [`${BASE}/${build}/neoforge-${build}-installer.jar`, "neoforge-installer.jar"]
    ]
  }
}
