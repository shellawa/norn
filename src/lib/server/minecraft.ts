import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import EventEmitter from "node:events"
import { type McServerInfo, type McServerResourceSample, type McServerResourceState, McServerStatus } from "$lib/types"
import path from "node:path"
import { appPaths } from "./config"
import os from "node:os"
import { readFile } from "node:fs/promises"
import { queryMinecraftStatus } from "./utils/minecraft-status"
import { calculateDirSize, getProcessUsage } from "./utils/resource"
import { ensureJava } from "./utils/java"

class MinecraftServer extends EventEmitter {
  readonly info: McServerInfo
  private status = McServerStatus.Stopped
  private process: ChildProcessWithoutNullStreams | null = null
  private logs: string[] = []
  private readonly MAX_LOGS_LENGTH = 1000
  private readonly MAX_RESOURCE_HISTORY = 45
  private readonly RESOURCE_SAMPLE_INTERVAL_MS = 2_000
  private readonly DIR_SIZE_INTERVAL_MS = 300_000
  private lastDirSizeCheckAt = 0
  private resourceHistory: McServerResourceSample[] = []
  private sampler: ReturnType<typeof setInterval> | null = null
  private startAt: number | null = null
  private statusPlayerCount: number | null = null
  private statusPort: number | null = null
  private serverDirSizeMb: number | null = null

  constructor(info: McServerInfo) {
    super()
    this.info = info
  }

  async start() {
    if (this.status != McServerStatus.Stopped) return

    this.status = McServerStatus.Starting
    this.emit("status", this.status)

    const serverPath = path.join(appPaths.servers, this.info.id)

    const javaPath = await ensureJava(this.info.javaVersion)
    const memoryArgs = [`-Xms${this.info.minMem ?? "1024M"}`, `-Xmx${this.info.maxMem ?? "4096M"}`]
    const extraJvmArgs = (this.info.jvmArgs ?? "")
      .trim()
      .split(/\s+/)
      .filter((x) => x.length > 0)
    const javaArgs = [...memoryArgs, ...extraJvmArgs, "-jar", this.info.jarPath, "nogui"]
    this.process = spawn(javaPath, javaArgs, { cwd: serverPath })

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
      this.startAt = Date.now()
      this.startResourceSampler()
      this.emit("status", this.status)
    })

    this.process.on("close", (code) => {
      this.status = McServerStatus.Stopped
      this.pushLog(Buffer.from(`Server stopped with code ${code}\n`))
      this.logs = []
      this.statusPlayerCount = null
      this.startAt = null
      this.stopResourceSampler()
      this.resourceHistory = []
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

  sendCommand(cmd: string) {
    if (this.process) {
      this.process.stdin.write(`${cmd}\n`)
      this.pushLog(Buffer.from("/" + cmd))
    }
  }

  private pushLog = (data: Buffer) => {
    const text = data.toString()
    this.logs.push(text)
    if (this.logs.length > this.MAX_LOGS_LENGTH) this.logs.shift()
    this.emit("log", text)
  }

  private async queryPlayersViaStatus() {
    try {
      if (this.statusPort == null) {
        if (Number.isInteger(this.info.port)) {
          this.statusPort = Number(this.info.port)
        } else {
          const serverPath = path.dirname(this.info.jarPath)
          const propertiesText = await readFile(path.join(serverPath, "server.properties"), "utf8")
          const portLine = propertiesText.match(/^server-port=(\d+)$/m)
          const parsed = Number.parseInt(portLine?.[1] ?? "25565", 10)
          this.statusPort = Number.isFinite(parsed) ? parsed : 25565
        }
      }

      const status = await queryMinecraftStatus("127.0.0.1", this.statusPort)
      this.statusPlayerCount = status.online
    } catch {
      this.statusPlayerCount = this.statusPlayerCount ?? 0
    }
  }

  private async queryServerDirSize() {
    const now = Date.now()

    if (now - this.lastDirSizeCheckAt < this.DIR_SIZE_INTERVAL_MS) {
      return
    }
    this.lastDirSizeCheckAt = now
    try {
      const serverPath = path.dirname(this.info.jarPath)
      const sizeBytes = await calculateDirSize(serverPath)
      this.serverDirSizeMb = Number((sizeBytes / (1024 * 1024)).toFixed(2))
    } catch {
      this.serverDirSizeMb = this.serverDirSizeMb ?? null
    }
  }

  private startResourceSampler() {
    if (this.sampler) return
    this.collectResourceSample()
    this.sampler = setInterval(() => this.collectResourceSample(), this.RESOURCE_SAMPLE_INTERVAL_MS)
  }

  private stopResourceSampler() {
    if (!this.sampler) return
    clearInterval(this.sampler)
    this.sampler = null
  }

  private async collectResourceSample() {
    const uptimeMs = this.startAt ? Date.now() - this.startAt : 0
    const memoryUsedPercent = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100

    const fallbackSample: McServerResourceSample = {
      at: Date.now(),
      cpuPercent: null,
      processRssMb: null,
      systemMemoryUsedPercent: Number(memoryUsedPercent.toFixed(2)),
      playerCount: this.statusPlayerCount ?? 0,
      serverDirSizeMb: this.serverDirSizeMb
    }

    if (!this.process?.pid) {
      this.pushResourceSample(fallbackSample)
      this.emit("resource", this.getResourceState(uptimeMs))
      return
    }

    try {
      const { cpu, rssKb } = await getProcessUsage(this.process.pid)

      const sample: McServerResourceSample = {
        at: Date.now(),
        cpuPercent: Number.isFinite(cpu) ? Number(cpu.toFixed(2)) : null,
        processRssMb: Number.isFinite(rssKb) ? Number((rssKb / 1024).toFixed(2)) : null,
        systemMemoryUsedPercent: Number(memoryUsedPercent.toFixed(2)),
        playerCount: this.statusPlayerCount ?? 0,
        serverDirSizeMb: this.serverDirSizeMb
      }

      this.pushResourceSample(sample)
      this.emit("resource", this.getResourceState(uptimeMs))
    } catch (error) {
      this.pushResourceSample(fallbackSample)
      this.emit("resource", this.getResourceState(uptimeMs))
    }

    void this.queryPlayersViaStatus()
    void this.queryServerDirSize()
  }

  private pushResourceSample(sample: McServerResourceSample) {
    this.resourceHistory.push(sample)
    if (this.resourceHistory.length > this.MAX_RESOURCE_HISTORY) this.resourceHistory.shift()
  }

  getLogs() {
    return this.logs
  }

  getStatus() {
    return this.status
  }

  syncInfo(next: McServerInfo) {
    Object.assign(this.info, next)
  }

  getResourceState(uptimeMsOverride?: number): McServerResourceState {
    const uptimeMs = uptimeMsOverride ?? (this.startAt ? Date.now() - this.startAt : 0)
    const last = this.resourceHistory.at(-1)
    const fallbackMemoryUsedPercent = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
    const fallbackSample: McServerResourceSample = {
      at: Date.now(),
      cpuPercent: null,
      processRssMb: null,
      systemMemoryUsedPercent: Number(fallbackMemoryUsedPercent.toFixed(2)),
      playerCount: this.statusPlayerCount ?? 0,
      serverDirSizeMb: this.serverDirSizeMb
    }

    return {
      sample: last ?? fallbackSample,
      history: [...this.resourceHistory],
      uptimeMs
    }
  }
}

export { MinecraftServer }
