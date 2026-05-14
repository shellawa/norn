import { appPaths } from "$lib/server/config"
import { minecraftServerManager } from "$lib/server/minecraft-server-manager"
import { calculateDirSize } from "$lib/server/utils/resource"
import type { FileItem } from "$lib/types"
import { json, type RequestHandler } from "@sveltejs/kit"
import { readdirSync, statSync, readFileSync, writeFileSync, rmSync, mkdirSync, renameSync, existsSync } from "node:fs"
import path from "node:path"

const validateAndGetPath = (serverId?: string, requestPath = "") => {
  if (!serverId) throw new Error("Missing server id")
  if (!minecraftServerManager.getServerInstance(serverId)) throw new Error("Unknown server")

  const basePath = path.resolve(appPaths.servers, serverId)
  const targetPath = path.resolve(basePath, requestPath)

  const relativePath = path.relative(basePath, targetPath)
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Forbidden path")
  }

  return targetPath
}

export const GET: RequestHandler = async ({ params, url }) => {
  try {
    const targetPath = validateAndGetPath(params.id, params.path)
    const stat = statSync(targetPath)

    if (url.searchParams.get("size") === "true") {
      if (!stat.isDirectory()) {
        return json({ error: "Size calculation is only supported for directories" }, { status: 400 })
      }

      return json({ size: await calculateDirSize(targetPath) })
    }

    if (stat.isFile()) {
      if (url.searchParams.get("download") === "true") {
        const buffer = readFileSync(targetPath)
        const filename = path.basename(targetPath)

        return new Response(buffer, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filename}"`
          }
        })
      }

      const content = readFileSync(targetPath, "utf-8")
      return json({ content })
    }

    const items = readdirSync(targetPath, { withFileTypes: true })
    const fileItems: FileItem[] = items.map((item) => {
      const itemStat = statSync(path.join(targetPath, item.name))
      return {
        name: item.name,
        type: item.isDirectory() ? "directory" : "file",
        lastModified: itemStat.mtimeMs,
        permissions: itemStat.mode,
        size: item.isDirectory() ? undefined : itemStat.size
      }
    })

    return json(fileItems)
  } catch (e: any) {
    return json({ error: e.message || "Path not found" }, { status: 400 })
  }
}

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const targetPath = validateAndGetPath(params.id, params.path)

    if (targetPath.endsWith(".createFolder")) {
      mkdirSync(path.resolve(targetPath, ".."))
      return json({ success: true })
    }

    const arrayBuffer = await request.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    writeFileSync(targetPath, buffer)

    return json({ success: true })
  } catch (e: any) {
    return json({ error: e.message || "Failed to save file" }, { status: 400 })
  }
}

export const PATCH: RequestHandler = async ({ params, request }) => {
  try {
    const body = await request.json()
    const from = body?.from
    const to = body?.to

    if (typeof from !== "string" || typeof to !== "string" || !from.trim() || !to.trim()) {
      return json({ error: "Both 'from' and 'to' paths are required" }, { status: 400 })
    }

    const fromPath = validateAndGetPath(params.id, from)
    const toPath = validateAndGetPath(params.id, to)

    if (!existsSync(fromPath)) {
      return json({ error: "Source path does not exist" }, { status: 404 })
    }

    if (existsSync(toPath)) {
      return json({ error: "Destination path already exists" }, { status: 409 })
    }

    mkdirSync(path.dirname(toPath), { recursive: true })
    renameSync(fromPath, toPath)

    return json({ success: true })
  } catch (e: any) {
    return json({ error: e.message || "Failed to move path" }, { status: 400 })
  }
}

export const DELETE: RequestHandler = ({ params }) => {
  try {
    const targetPath = validateAndGetPath(params.id, params.path)

    rmSync(targetPath, { recursive: true, force: true })

    return json({ success: true })
  } catch (e: any) {
    return json({ error: e.message || "Failed to delete path" }, { status: 400 })
  }
}
