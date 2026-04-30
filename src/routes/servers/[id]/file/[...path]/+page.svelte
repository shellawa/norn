<script lang="ts">
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import * as Breadcrumb from "$lib/components/shadcn-svelte/breadcrumb"
  import * as Pagination from "$lib/components/shadcn-svelte/pagination"
  import { ChevronLeft } from "lucide-svelte"

  import { goto, invalidateAll } from "$app/navigation"
  import { page } from "$app/state"
  import type { FileItem, FileManagerDialogState, McServerState } from "$lib/types"

  import FileTable from "$lib/components/panel/file-manager/FileTable.svelte"
  import FileManagerDialogs from "$lib/components/panel/file-manager/FileManagerDialogs.svelte"
  import { isLikelyTextFile, triggerDownload } from "$lib/utils/file"
  import { getContext } from "svelte"

  let { data } = $props()

  const serverState = getContext<McServerState>("serverState")

  let ui = $state({
    searchQuery: "",
    currentPage: 1,
    itemsPerPage: 50
  })

  let dialogs = $state<FileManagerDialogState>({
    viewer: { open: false, name: "", content: "" },
    newFolder: { open: false, name: "" },
    delete: { open: false, item: null },
    confirmView: { open: false, item: null }
  })

  let fileInput: HTMLInputElement

  let path = $derived(page.params.path || "")
  let segments = $derived(path ? path.split("/").filter(Boolean) : [])
  let basePath = $derived(`/servers/${page.params.id}/file`)
  let apiBasePath = $derived(`/api/servers/${page.params.id}/file${path ? "/" + path : ""}`)

  let filtered = $derived(
    data.fileItems
      .filter((f) => f.name.toLowerCase().includes(ui.searchQuery.toLowerCase()))
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1))
  )
  let paginated = $derived(filtered.slice((ui.currentPage - 1) * ui.itemsPerPage, ui.currentPage * ui.itemsPerPage))

  const goBack = () => goto(segments.length > 1 ? `${basePath}/${segments.slice(0, -1).join("/")}` : basePath)

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

  const handleUpload = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    await fetch(`${apiBasePath}/${file.name}`, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file
    })
    invalidateAll()
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
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "" })
    })
    dialogs.newFolder = { open: false, name: "" }
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
</script>

<svelte:head>
  <title>File - {serverState.info.name}</title>
</svelte:head>

<div class="space-y-4">
  <input type="file" bind:this={fileInput} class="hidden" onchange={handleUpload} />

  <div class="flex items-center gap-4">
    <Button variant="outline" size="icon" class="h-8 w-8" disabled={!segments.length} onclick={goBack}>
      <ChevronLeft class="h-4 w-4" />
      <span class="sr-only">Go back</span>
    </Button>

    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href={basePath}><div class="m-4">/</div></Breadcrumb.Link>
        </Breadcrumb.Item>
        {#each segments as segment, i}
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            {#if i === segments.length - 1}
              <Breadcrumb.Page>{segment}</Breadcrumb.Page>
            {:else}
              <Breadcrumb.Link href="{basePath}/{segments.slice(0, i + 1).join('/')}">{segment}</Breadcrumb.Link>
            {/if}
          </Breadcrumb.Item>
        {/each}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  </div>

  <div class="flex items-center justify-between">
    <Input
      placeholder="Search files..."
      class="max-w-sm"
      bind:value={ui.searchQuery}
      oninput={() => (ui.currentPage = 1)}
    />
    <div class="space-x-2">
      <Button variant="outline" onclick={() => (dialogs.newFolder.open = true)}>New Folder</Button>
      <Button onclick={() => fileInput.click()}>Upload File</Button>
    </div>
  </div>

  <FileTable
    items={paginated}
    isFilteredEmpty={filtered.length === 0}
    onNavigate={handleItemClick}
    onFileClick={handleFileClick}
    onDownload={(item) => triggerDownload(`${apiBasePath}/${item.name}?download=true`, item.name)}
    onDeleteClick={(item) => (dialogs.delete = { open: true, item })}
  />

  {#if filtered.length > ui.itemsPerPage}
    <Pagination.Root count={filtered.length} perPage={ui.itemsPerPage} bind:page={ui.currentPage}>
      {#snippet children({ pages, currentPage })}
        <Pagination.Content>
          <Pagination.Item><Pagination.PrevButton /></Pagination.Item>
          {#each pages as page (page.key)}
            {#if page.type === "ellipsis"}
              <Pagination.Item><Pagination.Ellipsis /></Pagination.Item>
            {:else}
              <Pagination.Item>
                <Pagination.Link {page} isActive={currentPage === page.value}>{page.value}</Pagination.Link>
              </Pagination.Item>
            {/if}
          {/each}
          <Pagination.Item><Pagination.NextButton /></Pagination.Item>
        </Pagination.Content>
      {/snippet}
    </Pagination.Root>
  {/if}
</div>

<FileManagerDialogs
  bind:dialogs
  onCreateFolder={createFolder}
  onDeleteItem={deleteItem}
  onConfirmView={openViewer}
  onSaveFile={saveFile}
/>
