export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
})

export const formatBytes = (b?: number) => {
  if (!b) return "--"
  const i = Math.floor(Math.log(b) / Math.log(1024))
  return `${parseFloat((b / 1024 ** i).toFixed(2))} ${["Bytes", "KB", "MB", "GB", "TB"][i]}`
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
