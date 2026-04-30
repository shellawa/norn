export enum McServerStatus {
  Stopped = "Stopped",
  Starting = "Starting",
  Running = "Running",
  Stopping = "Stopping"
}

export type McServerInfo = {
  id: string
  name: string
  jarPath: string
  minMem?: string
  maxMem?: string
  jvmArgs?: string
  host?: string
  port?: number
  offlineMode?: boolean
  maxPlayers?: number
  motd?: string
  pvp?: boolean
  seed?: string
  difficulty?: "easy" | "normal" | "hard" | "peaceful"
  gamemode?: "survival" | "creative" | "adventure" | "spectator"
  allowFlight?: boolean
  spawnProtection?: number
  createdAt?: string
}

export type McServerState = {
  info: McServerInfo
  status: McServerStatus
  logs: string[]
  resource: McServerResourceState
}

export type McServerResourceSample = {
  at: number
  cpuPercent: number | null
  processRssMb: number | null
  systemMemoryUsedPercent: number
  playerCount: number
  serverDirSizeMb: number | null
}

export type McServerResourceState = {
  sample: McServerResourceSample
  history: McServerResourceSample[]
  uptimeMs: number
}

export type FileItem = {
  name: string
  type: "file" | "directory"
  size?: number
  lastModified: number
  permissions: number
}

export type FileManagerDialogState = {
  viewer: { open: boolean; name: string; content: string }
  newFolder: { open: boolean; name: string }
  delete: { open: boolean; item: FileItem | null }
  confirmView: { open: boolean; item: FileItem | null }
}
