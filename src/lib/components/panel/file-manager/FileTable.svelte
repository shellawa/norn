<script lang="ts">
  import * as Table from "$lib/components/shadcn-svelte/table"
  import { FileText, Folder, Download, Trash2, SquarePen, Move, Pencil } from "lucide-svelte"
  import { formatBytes, formatLastModified } from "$lib/utils/file"
  import type { FileItem } from "$lib/types"

  let {
    items,
    isFilteredEmpty,
    onNavigate,
    onFileClick,
    onDownload,
    onDeleteClick,
    onMoveClick,
    onRenameClick,
    mode = "default"
  }: {
    items: FileItem[]
    isFilteredEmpty: boolean
    onNavigate: (item: FileItem) => void
    onFileClick: (item: FileItem) => void
    onDownload: (item: FileItem) => void
    onDeleteClick: (item: FileItem) => void
    onMoveClick: (item: FileItem) => void
    onRenameClick: (item: FileItem) => void
    mode?: "default" | "picker"
  } = $props()

  let contextMenu: {
    open: boolean
    x: number
    y: number
    item: FileItem | null
  } = $state({
    open: false,
    x: 0,
    y: 0,
    item: null
  })

  const openContextMenu = (e: MouseEvent, item: FileItem) => {
    e.preventDefault()
    e.stopPropagation()
    contextMenu = {
      open: true,
      x: e.clientX,
      y: e.clientY,
      item
    }
  }

  const closeContextMenu = () => {
    contextMenu.open = false
    contextMenu.item = null
  }

  const isContextMenuItem = (item: FileItem) =>
    contextMenu.open &&
    contextMenu.item !== null &&
    contextMenu.item.name === item.name &&
    contextMenu.item.type === item.type
</script>

<svelte:window
  onclick={() => closeContextMenu()}
  onkeydown={(e) => {
    if (e.key === "Escape") closeContextMenu()
  }}
/>

<div class="rounded-md border bg-card text-card-foreground shadow-sm">
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head class="w-12.5"></Table.Head>
        <Table.Head>Name</Table.Head>
        <Table.Head class="w-37.5">Size</Table.Head>
        <Table.Head class="w-50">Last Modified</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#if items.length === 0}
        <Table.Row>
          <Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
            {isFilteredEmpty ? "No files found." : "Page is empty."}
          </Table.Cell>
        </Table.Row>
      {:else}
        {#each items as item (item.name)}
          <Table.Row
            class={`cursor-pointer hover:bg-muted/50 ${isContextMenuItem(item) ? "bg-muted/50" : ""}`}
            role="button"
            tabindex={0}
            onclick={() => onNavigate(item)}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onNavigate(item)
              }
            }}
            oncontextmenu={(e) => openContextMenu(e, item)}
          >
            <Table.Cell class="py-3 text-center align-middle">
              <div class="flex items-center justify-center">
                {#if item.type === "directory"}
                  <Folder class="h-5 w-5 fill-blue-500/20 text-blue-500" />
                {:else}
                  <FileText class="h-5 w-5 text-muted-foreground" />
                {/if}
              </div>
            </Table.Cell>
            <Table.Cell class="py-3 font-medium">{item.name}</Table.Cell>
            <Table.Cell class="py-3 text-sm text-muted-foreground">{formatBytes(item.size)}</Table.Cell>
            <Table.Cell class="py-3 text-sm text-muted-foreground">{formatLastModified(item.lastModified)}</Table.Cell>
          </Table.Row>
        {/each}
      {/if}
    </Table.Body>
  </Table.Root>
</div>

{#if mode === "default" && contextMenu.open && contextMenu.item}
  <div
    role="menu"
    tabindex={-1}
    class="fixed z-50 min-w-40 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
    style={`left: ${contextMenu.x}px; top: ${contextMenu.y}px;`}
    onpointerdown={(e) => e.stopPropagation()}
    oncontextmenu={(e) => e.stopPropagation()}
  >
    {#if contextMenu.item.type === "file"}
      <button
        type="button"
        class="relative flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
        onclick={() => {
          onFileClick(contextMenu.item!)
          closeContextMenu()
        }}
      >
        <SquarePen class="h-4 w-4" /> View / Edit
      </button>
      <button
        type="button"
        class="relative flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
        onclick={() => {
          onDownload(contextMenu.item!)
          closeContextMenu()
        }}
      >
        <Download class="h-4 w-4" /> Download
      </button>
      <div class="my-1 h-px bg-border"></div>
    {/if}
    <button
      type="button"
      class="relative flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
      onclick={() => {
        onRenameClick(contextMenu.item!)
        closeContextMenu()
      }}
    >
      <Pencil class="h-4 w-4" /> Rename
    </button>
    <button
      type="button"
      class="relative flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
      onclick={() => {
        onMoveClick(contextMenu.item!)
        closeContextMenu()
      }}
    >
      <Move class="h-4 w-4" /> Move
    </button>
    <div class="my-1 h-px bg-border"></div>
    <button
      type="button"
      class="relative flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm text-destructive outline-hidden hover:bg-destructive/10 hover:text-destructive"
      onclick={() => {
        onDeleteClick(contextMenu.item!)
        closeContextMenu()
      }}
    >
      <Trash2 class="h-4 w-4" /> Delete
    </button>
  </div>
{/if}
