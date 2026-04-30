import type { ServerProvider, Version } from "./types"
import { fetchJson, guessJavaVersion } from "./utils"

const MANIFEST = "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"

type ManifestResponse = {
  versions: {
    id: string
    type: string
    url: string
  }[]
}

type VersionMetaResponse = {
  downloads: {
    server?: {
      url: string
    }
  }
}

export class VanillaProvider implements ServerProvider {
  readonly id = "vanilla"
  readonly name = "Vanilla"

  async getVersions(): Promise<Version[]> {
    const data = await fetchJson<ManifestResponse>(MANIFEST)

    return data.versions.map((v) => ({
      id: v.id,
      type: v.type as Version["type"],
      javaVersion: guessJavaVersion(v.id, v.type)
    }))
  }

  async getBuilds(version: string): Promise<string[]> {
    return ["release"]
  }

  async getDownloadUrl(version: string, build: string): Promise<[string, string][]> {
    const manifest = await fetchJson<ManifestResponse>(MANIFEST)
    const entry = manifest.versions.find((v) => v.id === version)

    if (!entry) throw new Error("Version not found")

    const meta = await fetchJson<VersionMetaResponse>(entry.url)
    const url = meta.downloads.server?.url

    if (!url) throw new Error("No server jar")

    return [[url, "server.jar"]]
  }
}
