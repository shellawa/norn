import { MinecraftServer } from "$lib/server/minecraft"
import { type McServerInfo, type McServerState } from "$lib/types"
import { serverDb } from "./db"

class MinecraftServerManager {
  private readonly servers = new Map<string, MinecraftServer>()

  getServerInstance(serverId: string): MinecraftServer | null {
    const info = serverDb.getServerInfo(serverId)
    if (!info) return null

    const existing = this.servers.get(serverId)
    if (existing) return existing

    const instance = new MinecraftServer(info)
    this.servers.set(serverId, instance)
    return instance
  }

  listServers(): McServerState[] {
    const servers = serverDb.listServers()
    return servers
      .map((x) => {
        const state = this.getServerState(x.id)
        if (state) state.logs = []
        return state
      })
      .filter((x) => x != null)
  }

  getServerState(serverId: string): McServerState | null {
    const server = this.getServerInstance(serverId)
    if (!server) return null

    return {
      info: { ...server.info },
      status: server.getStatus(),
      logs: server.getLogs()
    }
  }
}

export const minecraftServerManager = new MinecraftServerManager()
