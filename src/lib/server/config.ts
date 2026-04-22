import { mkdirSync } from "node:fs"
import path from "node:path"

const root = process.cwd()

export const appPaths = {
  data: path.resolve(root, "data"),
  servers: path.resolve(root, "data/servers"),
  db: path.resolve(root, "data/norn.sqlite")
}

mkdirSync(appPaths.data, { recursive: true })
mkdirSync(appPaths.servers, { recursive: true })
