import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import EventEmitter from "node:events"
import { type McServerInfo, McServerStatus } from "$lib/types"
import path from "node:path"
import { appPaths } from "./config"

class MinecraftServer extends EventEmitter {
  readonly info: McServerInfo
  private status = McServerStatus.Stopped
  private process: ChildProcessWithoutNullStreams | null = null
  private logs: string[] = []
  private readonly MAX_LOGS_LENGTH = 1000

  constructor(info: McServerInfo) {
    super()
    this.info = info
  }

  start() {
    if (this.status != McServerStatus.Stopped) return

    this.status = McServerStatus.Starting
    this.emit("status", this.status)

    const serverPath = path.join(appPaths.servers, this.info.id)
    this.process = spawn("java", ["-Xmx2G", "-jar", this.info.jarPath, "nogui"], { cwd: serverPath })

    this.process.stdout.on("data", this.pushLog)
    this.process.stderr.on("data", this.pushLog)
    this.process.on("error", (error) => {
      this.status = McServerStatus.Stopped
      this.pushLog(Buffer.from(`Failed to start server: ${error.message}\n`))
      this.process = null
      this.emit("status", this.status)
    })
    this.process.on("spawn", () => {
      this.status = McServerStatus.Running
      this.emit("status", this.status)
    })

    this.process.on("close", (code) => {
      this.status = McServerStatus.Stopped
      this.pushLog(Buffer.from(`Server stopped with code ${code}\n`))
      this.logs = []
      this.process = null
      this.emit("status", this.status)
    })
  }

  stop() {
    if (this.process) {
      this.process.stdin.write("stop\n")
      this.status = McServerStatus.Stopping
      this.emit("status", this.status)
    }
  }

  private pushLog = (data: Buffer) => {
    const text = data.toString()
    this.logs.push(text)
    if (this.logs.length > this.MAX_LOGS_LENGTH) this.logs.shift()
    this.emit("log", text)
  }

  getLogs() {
    return this.logs
  }

  getStatus() {
    return this.status
  }
}

export { MinecraftServer }
