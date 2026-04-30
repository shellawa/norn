import { readdir, stat } from "fs/promises"
import path from "path"
import pidusage from "pidusage"

export const calculateDirSize = async (dirPath: string): Promise<number> => {
  let size = 0
  try {
    const files = await readdir(dirPath, { withFileTypes: true })
    for (const file of files) {
      const filePath = path.join(dirPath, file.name)
      if (file.isDirectory()) {
        size += await calculateDirSize(filePath)
      } else if (file.isFile()) {
        const stats = await stat(filePath)
        size += stats.size
      }
    }
  } catch {}
  return size
}

export const getProcessUsage = async (pid: number): Promise<{ cpu: number; rssKb: number }> => {
  try {
    const stats = await pidusage(pid)
    return {
      cpu: stats.cpu,
      rssKb: stats.memory / 1024
    }
  } catch (error) {
    throw new Error(`Failed to get stats for PID ${pid}: ${error}`)
  }
}
