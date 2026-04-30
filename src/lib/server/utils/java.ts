import fs from "fs"
import path from "path"
import os from "os"
import { pipeline } from "stream/promises"
import { Readable } from "stream"
import * as tar from "tar"
import extractZip from "extract-zip"
import { appPaths } from "../config"

function getAdoptiumOS(): string {
  const platform = os.platform()
  if (platform === "win32") return "windows"
  if (platform === "darwin") return "mac"
  if (platform === "linux") return "linux"
  throw new Error(`Unsupported OS platform: ${platform}`)
}

function getAdoptiumArch(): string {
  const arch = os.arch()
  if (arch === "x64") return "x64"
  if (arch === "arm64") return "aarch64"
  throw new Error(`Unsupported CPU architecture: ${arch}`)
}

export async function ensureJava(version: number = 25): Promise<string> {
  const adoptOs = getAdoptiumOS()
  const adoptArch = getAdoptiumArch()

  const targetDir = path.resolve(appPaths.java, version.toString())
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    return findJavaExecutable(targetDir, adoptOs)
  }

  console.log(`Preparing to download Java ${version} for ${adoptOs}-${adoptArch}...`)

  await fs.promises.mkdir(targetDir, { recursive: true })

  const apiUrl = `https://api.adoptium.net/v3/binary/latest/${version}/ga/${adoptOs}/${adoptArch}/jre/hotspot/normal/eclipse?project=jdk`

  const response = await fetch(apiUrl)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download Java: ${response.statusText}`)
  }

  const isZip = adoptOs === "windows"
  const archiveExtension = isZip ? ".zip" : ".tar.gz"
  const tempArchiveFile = path.resolve(targetDir, `download${archiveExtension}`)

  console.log("Downloading archive...")

  const fileStream = fs.createWriteStream(tempArchiveFile)
  // @ts-ignore
  await pipeline(Readable.fromWeb(response.body), fileStream)

  console.log("Extracting archive...")

  if (isZip) {
    await extractZip(tempArchiveFile, { dir: targetDir })
  } else {
    await tar.x({
      file: tempArchiveFile,
      cwd: targetDir
    })
  }

  await fs.promises.unlink(tempArchiveFile)
  console.log("Java extraction complete!")

  return findJavaExecutable(targetDir, adoptOs)
}

function findJavaExecutable(runtimeDir: string, osType: string): string {
  const files = fs.readdirSync(runtimeDir)

  const extractedFolder = files.find((f) => fs.statSync(path.join(runtimeDir, f)).isDirectory())

  if (!extractedFolder) {
    throw new Error("Could not find extracted Java folder.")
  }

  const executableName = osType === "windows" ? "java.exe" : "java"

  if (osType === "mac") {
    return path.resolve(runtimeDir, extractedFolder, "Contents", "Home", "bin", executableName)
  }

  return path.resolve(runtimeDir, extractedFolder, "bin", executableName)
}
