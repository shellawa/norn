import { DatabaseSync } from "node:sqlite"
import { appPaths } from "$lib/server/config"
import { type McServerInfo } from "$lib/types"

export const db = new DatabaseSync(appPaths.db)
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    jarPath TEXT NOT NULL,
    minMem TEXT NOT NULL DEFAULT '1024M',
    maxMem TEXT NOT NULL DEFAULT '4096M',
    jvmArgs TEXT NOT NULL DEFAULT '',
    host TEXT NOT NULL DEFAULT '127.0.0.1',
    port INTEGER NOT NULL DEFAULT 25565,
    offlineMode INTEGER NOT NULL DEFAULT 0,
    maxPlayers INTEGER NOT NULL DEFAULT 20,
    motd TEXT NOT NULL DEFAULT 'A Minecraft Server',
    pvp INTEGER NOT NULL DEFAULT 1,
    seed TEXT NOT NULL DEFAULT '',
    difficulty TEXT NOT NULL DEFAULT 'normal',
    gamemode TEXT NOT NULL DEFAULT 'survival',
    allowFlight INTEGER NOT NULL DEFAULT 0,
    spawnProtection INTEGER NOT NULL DEFAULT 16,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    tokenHash TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    lastUsedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`)

const toInfo = (row: Record<string, unknown>): McServerInfo => ({
  id: String(row.id ?? ""),
  name: String(row.name ?? ""),
  jarPath: String(row.jarPath ?? ""),
  minMem: String(row.minMem ?? "1024M"),
  maxMem: String(row.maxMem ?? "4096M"),
  jvmArgs: String(row.jvmArgs ?? ""),
  host: String(row.host ?? "127.0.0.1"),
  port: Number(row.port ?? 25565),
  offlineMode: Boolean(row.offlineMode),
  maxPlayers: Number(row.maxPlayers ?? 20),
  motd: String(row.motd ?? "A Minecraft Server"),
  pvp: Boolean(row.pvp ?? 1),
  seed: String(row.seed ?? ""),
  difficulty: String(row.difficulty ?? "normal") as McServerInfo["difficulty"],
  gamemode: String(row.gamemode ?? "survival") as McServerInfo["gamemode"],
  allowFlight: Boolean(row.allowFlight),
  spawnProtection: Number(row.spawnProtection ?? 16),
  createdAt: String(row.createdAt ?? new Date().toISOString())
})

const serverDb = {
  listServers(): McServerInfo[] {
    const rows = db.prepare("SELECT * FROM servers ORDER BY createdAt ASC, id ASC").all() as Record<string, unknown>[]
    return rows.map(toInfo)
  },

  getServerInfo(serverId: string): McServerInfo | null {
    const row = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as Record<string, unknown> | undefined
    return row ? toInfo(row) : null
  },

  createServer(info: McServerInfo): McServerInfo {
    const createdAt = info.createdAt ?? new Date().toISOString()
    db.prepare(
      "INSERT INTO servers (id, name, jarPath, minMem, maxMem, jvmArgs, host, port, offlineMode, maxPlayers, motd, pvp, seed, difficulty, gamemode, allowFlight, spawnProtection, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      info.id,
      info.name,
      info.jarPath,
      info.minMem ?? "1024M",
      info.maxMem ?? "4096M",
      info.jvmArgs ?? "",
      info.host ?? "127.0.0.1",
      info.port ?? 25565,
      info.offlineMode ? 1 : 0,
      info.maxPlayers ?? 20,
      info.motd ?? "A Minecraft Server",
      info.pvp === false ? 0 : 1,
      info.seed ?? "",
      info.difficulty ?? "normal",
      info.gamemode ?? "survival",
      info.allowFlight ? 1 : 0,
      info.spawnProtection ?? 16,
      createdAt
    )
    return {
      ...info,
      minMem: info.minMem ?? "1024M",
      maxMem: info.maxMem ?? "4096M",
      jvmArgs: info.jvmArgs ?? "",
      host: info.host ?? "127.0.0.1",
      port: info.port ?? 25565,
      offlineMode: info.offlineMode ?? false,
      maxPlayers: info.maxPlayers ?? 20,
      motd: info.motd ?? "A Minecraft Server",
      pvp: info.pvp ?? true,
      seed: info.seed ?? "",
      difficulty: info.difficulty ?? "normal",
      gamemode: info.gamemode ?? "survival",
      allowFlight: info.allowFlight ?? false,
      spawnProtection: info.spawnProtection ?? 16,
      createdAt
    }
  },

  updateServer(serverId: string, patch: Partial<McServerInfo>): McServerInfo | null {
    const current = this.getServerInfo(serverId)
    if (!current) return null

    const next: McServerInfo = {
      ...current,
      ...patch,
      id: current.id,
      jarPath: current.jarPath,
      createdAt: current.createdAt
    }

    db.prepare(
      "UPDATE servers SET name = ?, minMem = ?, maxMem = ?, jvmArgs = ?, host = ?, port = ?, offlineMode = ?, maxPlayers = ?, motd = ?, pvp = ?, seed = ?, difficulty = ?, gamemode = ?, allowFlight = ?, spawnProtection = ? WHERE id = ?"
    ).run(
      next.name,
      next.minMem ?? "1024M",
      next.maxMem ?? "4096M",
      next.jvmArgs ?? "",
      next.host ?? "127.0.0.1",
      next.port ?? 25565,
      next.offlineMode ? 1 : 0,
      next.maxPlayers ?? 20,
      next.motd ?? "A Minecraft Server",
      next.pvp === false ? 0 : 1,
      next.seed ?? "",
      next.difficulty ?? "normal",
      next.gamemode ?? "survival",
      next.allowFlight ? 1 : 0,
      next.spawnProtection ?? 16,
      serverId
    )

    return this.getServerInfo(serverId)
  }
}

export { serverDb }
