export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
})

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })
const RECENT_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000

export const formatBytes = (b?: number) => {
  if (!b) return "--"
  const i = Math.floor(Math.log(b) / Math.log(1024))
  return `${parseFloat((b / 1024 ** i).toFixed(2))} ${["Bytes", "KB", "MB", "GB", "TB"][i]}`
}

export const formatLastModified = (timeMs: number) => {
  const diffMs = Date.now() - timeMs
  if (diffMs >= 0 && diffMs <= RECENT_THRESHOLD_MS) {
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return relativeTimeFormatter.format(-diffSec, "second")
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return relativeTimeFormatter.format(-diffMin, "minute")
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return relativeTimeFormatter.format(-diffHour, "hour")
    const diffDay = Math.floor(diffHour / 24)
    return relativeTimeFormatter.format(-diffDay, "day")
  }

  return dateFormatter.format(timeMs)
}

const textExtensions = [
  "txt",
  "json",
  "yml",
  "yaml",
  "properties",
  "toml",
  "cfg",
  "conf",
  "ini",
  "md",
  "csv",
  "log",
  "js",
  "ts",
  "html",
  "py",
  "css",
  "xml",
  "mcmeta"
]

export const isLikelyTextFile = (name: string) => {
  const parts = name.split(".")
  if (parts.length === 1) return false
  return textExtensions.includes(parts[parts.length - 1].toLowerCase())
}

export const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
