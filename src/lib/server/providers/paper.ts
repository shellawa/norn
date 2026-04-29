import type { ServerProvider, Version } from "./types"
import { fetchJson, guessJavaVersion } from "./utils"

const FILL_BASE = "https://fill.papermc.io/v3"
const FILL_UA = "norn/1.0 (https://github.com/shellawa/norn)"

type PaperResponse = {
  ok?: boolean
  message?: string
  versions: Record<string, string[]>
}

type PaperBuild = {
  id: string
  downloads?: {
    "server:default"?: { url: string }
  }
}

type BuildApiResponse = PaperBuild[] | { message?: string }

export class PaperProvider implements ServerProvider {
  readonly id: string
  readonly name: string
  private readonly project: "paper" | "folia"

  constructor(project: "paper" | "folia" = "paper") {
    this.project = project
    this.id = project
    this.name = project === "paper" ? "Paper" : "Folia"
  }

  private headers = { "User-Agent": FILL_UA }

  async getVersions(): Promise<Version[]> {
    const data = await fetchJson<PaperResponse>(`${FILL_BASE}/projects/${this.project}`, {
      headers: this.headers
    })

    if (data.ok === false) throw new Error(data.message ?? "Paper API error")

    return Object.values(data.versions)
      .flat()
      .map((version) => ({
        id: version,
        type: "release",
        javaVersion: guessJavaVersion(version, "release")
      }))
  }

  async getBuilds(version: string): Promise<string[]> {
    const data = await fetchJson<BuildApiResponse>(
      `${FILL_BASE}/projects/${this.project}/versions/${encodeURIComponent(version)}/builds`,
      { headers: this.headers }
    )

    if (!Array.isArray(data)) {
      throw new Error(data.message ?? "Paper API error")
    }

    return data.slice().map((b) => String(b.id))
  }

  async getDownloadUrl(version: string, build: string): Promise<string> {
    const builds = await fetchJson<BuildApiResponse>(
      `${FILL_BASE}/projects/${this.project}/versions/${encodeURIComponent(version)}/builds`,
      { headers: this.headers }
    )

    if (!Array.isArray(builds)) {
      throw new Error(builds.message ?? "Paper API error")
    }

    const target = builds.find((b) => String(b.id) === build)

    if (!target) throw new Error(`No build found for ${this.name} ${version} build ${build}`)

    const url = target.downloads?.["server:default"]?.url
    if (!url) throw new Error(`No download URL in build ${target.id}`)

    return url
  }
}

export class FoliaProvider extends PaperProvider {
  constructor() {
    super("folia")
  }
}
