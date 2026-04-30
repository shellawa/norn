import type { ServerProvider, Version } from "./types"
import { fetchJson, guessJavaVersion } from "./utils"

const BASE = "https://api.purpurmc.org/v2/purpur"

type PurpurVersionsResponse = {
  versions: string[]
}

type PurpurBuildsResponse = {
  builds: {
    all: string[]
  }
}

export class PurpurProvider implements ServerProvider {
  readonly id = "purpur"
  readonly name = "Purpur"

  async getVersions(): Promise<Version[]> {
    const data = await fetchJson<PurpurVersionsResponse>(BASE)

    return data.versions
      .slice()
      .reverse()
      .map((v) => ({
        id: v,
        type: "release",
        javaVersion: guessJavaVersion(v, "release")
      }))
  }

  async getBuilds(version: string): Promise<string[]> {
    const data = await fetchJson<PurpurBuildsResponse>(`${BASE}/${version}`)
    return data.builds.all.reverse()
  }

  async getDownloadUrl(version: string, build: string): Promise<[string, string][]> {
    return [[`${BASE}/${version}/${build}/download`, "server.jar"]]
  }
}
