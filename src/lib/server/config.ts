import { mkdirSync } from "node:fs"
import path from "node:path"

const root = process.cwd()

export const appPaths = {
  data: path.resolve(root, "data"),
  servers: path.resolve(root, "data/servers"),
  db: path.resolve(root, "data/norn.sqlite"),
  java: path.resolve(root, "data/runtimes")
}

mkdirSync(appPaths.data, { recursive: true })
mkdirSync(appPaths.servers, { recursive: true })
mkdirSync(appPaths.java, { recursive: true })
