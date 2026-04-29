import type { ServerProvider, Version } from "./types"
import { fetchJson, guessJavaVersion } from "./utils"

const PROMO = "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json"
const MAVEN = "https://maven.minecraftforge.net/net/minecraftforge/forge"

type ForgePromotionsResponse = {
  promos: Record<string, string>
}

export class ForgeProvider implements ServerProvider {
  readonly id = "forge"
  readonly name = "Forge"

  async getVersions(): Promise<Version[]> {
    const data = await fetchJson<ForgePromotionsResponse>(PROMO)
    const versions = new Set<string>()

    for (const key of Object.keys(data.promos)) {
      const [mc] = key.split("-")
      versions.add(mc)
    }

    return [...versions].reverse().map((v) => ({
      id: v,
      type: "release",
      javaVersion: guessJavaVersion(v, "release")
    }))
  }

  async getBuilds(version: string): Promise<string[]> {
    const data = await fetchJson<ForgePromotionsResponse>(PROMO)

    const builds: string[] = []

    for (const [k, v] of Object.entries(data.promos)) {
      if (k.startsWith(version)) {
        builds.push(v)
      }
    }

    return builds
  }

  async getDownloadUrl(version: string, build: string): Promise<string> {
    return `${MAVEN}/${version}-${build}/forge-${version}-${build}-installer.jar`
  }
}
