export interface Version {
  id: string
  type: "release" | "snapshot" | "old_beta" | "old_alpha"
  javaVersion?: number
}

export interface ServerProvider {
  readonly id: string
  readonly name: string

  getVersions(): Promise<Version[]>
  getBuilds(version: string): Promise<string[]>
  getDownloadUrl(version: string, build: string): Promise<[string, string][]>
  install?(version: string, build: string): string[]
}
