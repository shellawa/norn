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
  createdAt?: string
}

export type McServerState = {
  info: McServerInfo
  status: McServerStatus
  logs: string[]
}
