import { DatabaseSync } from "node:sqlite"
import { appPaths } from "$lib/server/config"
import { type McServerInfo } from "$lib/types"

const db = new DatabaseSync(appPaths.db)
db.exec(`
  CREATE TABLE IF NOT EXISTS servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    jarPath TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`)

const serverDb = {
  listServers(): McServerInfo[] {
    const rows = db.prepare("SELECT * FROM servers ORDER BY createdAt ASC, id ASC").all() as McServerInfo[]
    return rows
  },

  getServerInfo(serverId: string): McServerInfo | null {
    const row = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as McServerInfo
    return row ? row : null
  }
}

export { serverDb }
