import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import EventEmitter from "node:events"
import { McServerStatus } from "$lib/types"

class MinecraftServer extends EventEmitter {
  private status = McServerStatus.Stopped
  private process: ChildProcessWithoutNullStreams | null = null
  private logs: string[] = []
  private readonly MAX_LOGS_LENGTH = 1000

  constructor() {
    super()
  }

  start() {
    if (this.status != McServerStatus.Stopped) return

    this.process = spawn("java", ["-Xmx2G", "-jar", "server.jar", "nogui"], { cwd: "servers/test" })

    this.process.stdout.on("data", this.pushLog)
    this.process.stderr.on("data", this.pushLog)

    this.process.on("close", (code) => {
      this.status = McServerStatus.Stopped
      this.pushLog(Buffer.from(`Server stopped with code ${code}\n`))
      this.logs = []
      this.process = null
      this.emit("status", this.status)
    })

    this.status = McServerStatus.Running
    this.emit("status", this.status)
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

  getLogsHistory() {
    return this.logs
  }

  getStatus() {
    return this.status
  }
}

export const mcServer = new MinecraftServer()
