<script lang="ts">
  import { Button } from "$lib/components/shadcn-svelte/button"

  import { goto, invalidateAll } from "$app/navigation"
  import { page } from "$app/state"
  import type { FileItem, FileManagerDialogState, McServerState } from "$lib/types"

  import FileBrowserPanel from "$lib/components/panel/file-manager/FileBrowserPanel.svelte"
  import ViewerDialog from "$lib/components/panel/file-manager/dialogs/ViewerDialog.svelte"
  import NewFolderDialog from "$lib/components/panel/file-manager/dialogs/NewFolderDialog.svelte"
  import NewFileDialog from "$lib/components/panel/file-manager/dialogs/NewFileDialog.svelte"
  import RenameDialog from "$lib/components/panel/file-manager/dialogs/RenameDialog.svelte"
  import MoveDialog from "$lib/components/panel/file-manager/dialogs/MoveDialog.svelte"
  import DeleteDialog from "$lib/components/panel/file-manager/dialogs/DeleteDialog.svelte"
  import ConfirmViewDialog from "$lib/components/panel/file-manager/dialogs/ConfirmViewDialog.svelte"
  import { isLikelyTextFile, triggerDownload } from "$lib/utils/file"
  import { getContext } from "svelte"

  let { data } = $props()

  const serverState: McServerState = getContext("serverState")

  let ui = $state({
    searchQuery: "",
    currentPage: 1
  })

  let dialogs: FileManagerDialogState = $state({
    viewer: { open: false, name: "", content: "" },
    newFolder: { open: false, name: "" },
    newFile: { open: false, name: "" },
    rename: { open: false, item: null, name: "" },
    move: { open: false, item: null, browserPath: "", selectedFolder: "", folders: [], loading: false, error: "" },
    delete: { open: false, item: null },
    confirmView: { open: false, item: null }
  })

  type UploadEntry = {
    id: string
    name: string
    progress: number
    status: "uploading" | "done" | "failed"
    error?: string
  }

  let uploadQueue: UploadEntry[] = $state([])

  let folderSizeCache: Record<string, number> = $state({})

  let fileInput: HTMLInputElement

  let path = $derived(page.params.path || "")
  let segments = $derived(path ? path.split("/").filter(Boolean) : [])
  let basePath = $derived(`/servers/${page.params.id}/file`)
  let apiBasePath = $derived(`/api/servers/${page.params.id}/file${path ? "/" + path : ""}`)

  let mergedItems = $derived(
    data.fileItems.map((item: FileItem) => {
      const itemPath = path ? `${path}/${item.name}` : item.name
      if (item.type === "directory" && folderSizeCache[itemPath] !== undefined) {
        return { ...item, size: folderSizeCache[itemPath] }
      }
      return item
    })
  )

  const goBack = () => goto(segments.length > 1 ? `${basePath}/${segments.slice(0, -1).join("/")}` : basePath)
  const goToPath = (targetPath: string) => goto(targetPath ? `${basePath}/${targetPath}` : basePath)

  const handleItemClick = (item: FileItem) => {
    if (item.type === "directory") goto(`${basePath}${path ? "/" : ""}${path}/${item.name}`)
    else handleFileClick(item)
  }

  const handleFileClick = (item: FileItem) => {
    if (isLikelyTextFile(item.name)) openViewer(item)
    else dialogs.confirmView = { open: true, item }
  }

  const openViewer = async (item: FileItem) => {
    dialogs.confirmView.open = false
    const res = await fetch(`${apiBasePath}/${item.name}`)
    const { content } = await res.json()
    if (content !== undefined) {
      dialogs.viewer = { open: true, name: item.name, content }
    }
  }

  const uploadSingleFile = (file: File, id: string): Promise<void> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("PUT", `${apiBasePath}/${encodeURIComponent(file.name)}`)
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream")

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        const progress = Math.round((event.loaded / event.total) * 100)
        uploadQueue = uploadQueue.map((entry) => (entry.id === id ? { ...entry, progress } : entry))
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          uploadQueue = uploadQueue.map((entry) =>
            entry.id === id ? { ...entry, progress: 100, status: "done" } : entry
          )
          resolve()
        } else {
          uploadQueue = uploadQueue.map((entry) =>
            entry.id === id ? { ...entry, status: "failed", error: xhr.responseText || "Upload failed" } : entry
          )
          reject(new Error("Upload failed"))
        }
      }

      xhr.onerror = () => {
        uploadQueue = uploadQueue.map((entry) =>
          entry.id === id ? { ...entry, status: "failed", error: "Network error" } : entry
        )
        reject(new Error("Network error"))
      }

      xhr.send(file)
    })

  const runUploadQueue = async (files: File[]) => {
    const concurrency = 3
    let cursor = 0

    const worker = async () => {
      while (cursor < files.length) {
        const index = cursor++
        const file = files[index]
        const id = `${Date.now()}-${index}-${file.name}`

        uploadQueue = [...uploadQueue, { id, name: file.name, progress: 0, status: "uploading" }]

        try {
          await uploadSingleFile(file, id)
        } catch {
          // per-file errors are tracked in queue state
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, () => worker()))
    await invalidateAll()
  }

  const handleUpload = async (e: Event) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    if (!files.length) return
    await runUploadQueue(files)
    fileInput.value = ""
  }

  const deleteItem = async () => {
    if (!dialogs.delete.item) return
    await fetch(`${apiBasePath}/${dialogs.delete.item.name}`, { method: "DELETE" })
    dialogs.delete = { open: false, item: null }
    invalidateAll()
  }

  const createFolder = async () => {
    if (!dialogs.newFolder.name.trim()) return
    await fetch(`${apiBasePath}/${dialogs.newFolder.name}/.createFolder`, {
      method: "PUT"
    })
    dialogs.newFolder = { open: false, name: "" }
    invalidateAll()
  }

  const createFile = async () => {
    if (!dialogs.newFile.name.trim()) return
    await fetch(`${apiBasePath}/${dialogs.newFile.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "text/plain"
      },
      body: ""
    })

    dialogs.newFile = { open: false, name: "" }
    invalidateAll()
  }

  const saveFile = async (name: string, content: string) => {
    await fetch(`${apiBasePath}/${name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "text/plain"
      },
      body: content
    })

    dialogs.viewer.open = false
    invalidateAll()
  }

  const openRenameDialog = (item: FileItem) => {
    dialogs.rename = {
      open: true,
      item,
      name: item.name
    }
  }

  const renameItem = async () => {
    const item = dialogs.rename.item
    const newName = dialogs.rename.name.trim()
    if (!item || !newName || newName === item.name) return

    const from = path ? `${path}/${item.name}` : item.name
    const to = path ? `${path}/${newName}` : newName

    await fetch(apiBasePath, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to })
    })

    dialogs.rename = { open: false, item: null, name: "" }
    invalidateAll()
  }

  const loadMoveFolders = async (folderPath: string) => {
    dialogs.move.loading = true
    dialogs.move.error = ""
    try {
      const endpoint = `/api/servers/${page.params.id}/file${folderPath ? `/${folderPath}` : ""}`
      const res = await fetch(endpoint)
      const items = (await res.json()) as FileItem[]
      const movingFolderPath =
        dialogs.move.item?.type === "directory"
          ? path
            ? `${path}/${dialogs.move.item.name}`
            : dialogs.move.item.name
          : null

      dialogs.move.folders = items.filter((item) => {
        if (item.type !== "directory") return false
        if (!movingFolderPath) return true

        const candidatePath = folderPath ? `${folderPath}/${item.name}` : item.name
        return candidatePath !== movingFolderPath
      })
      dialogs.move.browserPath = folderPath
      dialogs.move.selectedFolder = folderPath
    } catch {
      dialogs.move.error = "Failed to load destination folders"
      dialogs.move.folders = []
    } finally {
      dialogs.move.loading = false
    }
  }

  const openMoveDialog = async (item: FileItem) => {
    dialogs.move = {
      open: true,
      item,
      browserPath: path,
      selectedFolder: path,
      folders: [],
      loading: false,
      error: ""
    }
    await loadMoveFolders(path)
  }

  const moveItem = async () => {
    const item = dialogs.move.item
    if (!item) return

    const from = path ? `${path}/${item.name}` : item.name
    const destinationFolder = dialogs.move.selectedFolder.trim()
    const to = destinationFolder ? `${destinationFolder}/${item.name}` : item.name

    if (from === to) return

    await fetch(apiBasePath, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to })
    })

    dialogs.move = {
      open: false,
      item: null,
      browserPath: "",
      selectedFolder: "",
      folders: [],
      loading: false,
      error: ""
    }
    invalidateAll()
  }

  const moveNavigate = async (folder: FileItem) => {
    const nextPath = dialogs.move.browserPath ? `${dialogs.move.browserPath}/${folder.name}` : folder.name
    await loadMoveFolders(nextPath)
  }

  const moveBack = async () => {
    const segments = dialogs.move.browserPath.split("/").filter(Boolean)
    const parentPath = segments.slice(0, -1).join("/")
    await loadMoveFolders(parentPath)
  }

  const moveToPath = async (targetPath: string) => {
    await loadMoveFolders(targetPath)
  }

  $effect(() => {
    const directories = data.fileItems.filter((item: FileItem) => item.type === "directory")
    let cancelled = false

    const run = async () => {
      for (const item of directories) {
        if (cancelled) return

        const sizeKey = path ? `${path}/${item.name}` : item.name
        if (folderSizeCache[sizeKey] !== undefined) continue

        try {
          const res = await fetch(`${apiBasePath}/${item.name}?size=true`)
          const body = await res.json()
          if (typeof body.size === "number") {
            folderSizeCache = { ...folderSizeCache, [sizeKey]: body.size }
          }
        } catch {
          // Keep showing unknown size if request fails.
        }

        await new Promise((resolve) => setTimeout(resolve, 60))
      }
    }

    run()

    return () => {
      cancelled = true
    }
  })
</script>

<svelte:head>
  <title>File - {serverState.info.name}</title>
</svelte:head>

<div class="space-y-4">
  <input type="file" bind:this={fileInput} class="hidden" onchange={handleUpload} multiple />

  {#if uploadQueue.length > 0}
    <div class="space-y-2 rounded-md border p-3">
      {#each uploadQueue as upload (upload.id)}
        <div class="space-y-1">
          <div class="flex items-center justify-between text-sm">
            <span class="truncate">{upload.name}</span>
            <span class={upload.status === "failed" ? "text-destructive" : "text-muted-foreground"}>
              {upload.status === "uploading" ? `${upload.progress}%` : upload.status}
            </span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded bg-muted">
            <div
              class={upload.status === "failed" ? "h-full bg-destructive" : "h-full bg-primary"}
              style={`width: ${upload.progress}%`}
            ></div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <FileBrowserPanel
    items={mergedItems}
    {segments}
    bind:searchQuery={ui.searchQuery}
    bind:currentPage={ui.currentPage}
    backDisabled={!segments.length}
    onBack={goBack}
    onCrumbNavigate={goToPath}
    onNavigate={handleItemClick}
    onFileClick={handleFileClick}
    onDownload={(item) => triggerDownload(`${apiBasePath}/${item.name}?download=true`, item.name)}
    onRenameClick={openRenameDialog}
    onMoveClick={openMoveDialog}
    onDeleteClick={(item) => (dialogs.delete = { open: true, item })}
  >
    {#snippet toolbarActions()}
      <Button variant="outline" onclick={() => (dialogs.newFolder.open = true)}>New Folder</Button>
      <Button variant="outline" onclick={() => (dialogs.newFile.open = true)}>New File</Button>
      <Button onclick={() => fileInput.click()}>Upload Files</Button>
    {/snippet}
  </FileBrowserPanel>
</div>

<ViewerDialog bind:viewer={dialogs.viewer} onSaveFile={saveFile} />
<NewFolderDialog bind:newFolder={dialogs.newFolder} onCreateFolder={createFolder} />
<NewFileDialog bind:newFile={dialogs.newFile} onCreateFile={createFile} />
<RenameDialog bind:rename={dialogs.rename} onRenameItem={renameItem} />
<MoveDialog
  bind:move={dialogs.move}
  onMoveItem={moveItem}
  onMoveNavigate={moveNavigate}
  onMoveBack={moveBack}
  onMovePath={moveToPath}
/>
<DeleteDialog bind:deleteDialog={dialogs.delete} onDeleteItem={deleteItem} />
<ConfirmViewDialog bind:confirmView={dialogs.confirmView} onConfirmView={openViewer} />
