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

  async getDownloadUrl(version: string, build: string): Promise<[string, string][]> {
    const major = Number(version.split(".")[0])

    if (major >= 17) {
      return [
        ["https://github.com/neoforged/ServerStarterJar/releases/download/0.1.34/server.jar", "server.jar"],
        [`${MAVEN}/${version}-${build}/forge-${version}-${build}-installer.jar`, "forge-installer.jar"]
      ]
    }

    return [
      // old installer variants
      [`${MAVEN}/${version}-${build}/forge-${version}-${build}-installer.jar`, "installer.jar"],
      [`${MAVEN}/${version}-${build}-${version}/forge-${version}-${build}-${version}-installer.jar`, "installer.jar"],
      [
        `${MAVEN}/${version}-${build}-${version}.0/forge-${version}-${build}-${version}.0-installer.jar`,
        "installer.jar"
      ],
      [`${MAVEN}/${version}-${build}-mc172/forge-${version}-${build}-mc172-installer.jar`, "installer.jar"]
    ]
  }

  install(version: string): string[] {
    const major = Number(version.split(".")[0])
    if (major >= 17) return []

    return [
      "java -jar installer.jar --installServer || true",
      "mv forge-*.jar server.jar || true",
      "rm -f installer.jar installer.jar.log"
    ]
  }
}
