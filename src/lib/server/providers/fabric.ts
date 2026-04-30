import type { ServerProvider, Version } from "./types"
import { fetchJson, guessJavaVersion } from "./utils"

const META = "https://meta.fabricmc.net/v2"

type FabricGameVersion = {
  version: string
  stable: boolean
}

type FabricLoaderVersion = {
  loader: {
    version: string
  }
}

type FabricInstallerVersion = {
  version: string
  stable: boolean
}

export class FabricProvider implements ServerProvider {
  readonly id = "fabric"
  readonly name = "Fabric"

  async getVersions(): Promise<Version[]> {
    const versions = await fetchJson<FabricGameVersion[]>(`${META}/versions/game`)

    return versions.map((v) => ({
      id: v.version,
      type: v.stable ? "release" : "snapshot",
      javaVersion: guessJavaVersion(v.version, v.stable ? "release" : "snapshot")
    }))
  }

  /** loader version instead of build */
  async getBuilds(version: string): Promise<string[]> {
    const loaders = await fetchJson<FabricLoaderVersion[]>(
      `${META}/versions/loader/${encodeURIComponent(version)}`
    ).catch(() => [])

    return loaders.map((l) => l.loader.version)
  }

  async getDownloadUrl(version: string, build: string): Promise<[string, string][]> {
    const installers = await fetchJson<FabricInstallerVersion[]>(`${META}/versions/installer`)
    const installer = installers.find((i) => i.stable)?.version ?? installers[0]?.version

    if (!installer) throw new Error("No Fabric installer found")

    return [[`${META}/versions/loader/${encodeURIComponent(version)}/${build}/${installer}/server/jar`, "server.jar"]]
  }
}
