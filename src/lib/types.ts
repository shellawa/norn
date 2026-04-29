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
  createdAt?: string
}

export type McServerState = {
  info: McServerInfo
  status: McServerStatus
  logs: string[]
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
