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
try {
  db.exec("ALTER TABLE servers ADD COLUMN minMem TEXT NOT NULL DEFAULT '1024M'")
} catch {}
try {
  db.exec("ALTER TABLE servers ADD COLUMN maxMem TEXT NOT NULL DEFAULT '4096M'")
} catch {}
try {
  db.exec("ALTER TABLE servers ADD COLUMN jvmArgs TEXT NOT NULL DEFAULT ''")
} catch {}

const serverDb = {
  listServers(): McServerInfo[] {
    const rows = db.prepare("SELECT * FROM servers ORDER BY createdAt ASC, id ASC").all() as McServerInfo[]
    return rows
  },

  getServerInfo(serverId: string): McServerInfo | null {
    const row = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as McServerInfo
    return row ? row : null
  },

  createServer(info: McServerInfo): McServerInfo {
    const createdAt = info.createdAt ?? new Date().toISOString()
    db.prepare(
      "INSERT INTO servers (id, name, jarPath, minMem, maxMem, jvmArgs, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(
      info.id,
      info.name,
      info.jarPath,
      info.minMem ?? "1024M",
      info.maxMem ?? "4096M",
      info.jvmArgs ?? "",
      createdAt
    )
    return {
      ...info,
      minMem: info.minMem ?? "1024M",
      maxMem: info.maxMem ?? "4096M",
      jvmArgs: info.jvmArgs ?? "",
      createdAt
    }
  }
}

export { serverDb }
