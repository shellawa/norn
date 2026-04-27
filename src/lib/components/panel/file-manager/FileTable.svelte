<script lang="ts">
  import * as Table from "$lib/components/shadcn-svelte/table"
  import * as DropdownMenu from "$lib/components/shadcn-svelte/dropdown-menu"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { FileText, Folder, Ellipsis, Download, Trash2, SquarePen } from "lucide-svelte"
  import { formatBytes, dateFormatter } from "$lib/utils/file"
  import type { FileItem } from "$lib/types"

  let { items, isFilteredEmpty, onNavigate, onFileClick, onDownload, onDeleteClick } = $props<{
    items: FileItem[]
    isFilteredEmpty: boolean
    onNavigate: (item: FileItem) => void
    onFileClick: (item: FileItem) => void
    onDownload: (item: FileItem) => void
    onDeleteClick: (item: FileItem) => void
  }>()
</script>

<div class="rounded-md border bg-card text-card-foreground shadow-sm">
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head class="w-12.5"></Table.Head>
        <Table.Head>Name</Table.Head>
        <Table.Head class="w-37.5">Size</Table.Head>
        <Table.Head class="w-50">Last Modified</Table.Head>
        <Table.Head class="w-25 text-right">Actions</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#if items.length === 0}
        <Table.Row>
          <Table.Cell colspan={5} class="h-24 text-center text-muted-foreground">
            {isFilteredEmpty ? "No files found." : "Page is empty."}
          </Table.Cell>
        </Table.Row>
      {:else}
        {#each items as item (item.name)}
          <Table.Row class="cursor-pointer hover:bg-muted/50" onclick={() => onNavigate(item)}>
            <Table.Cell>
              {#if item.type === "directory"}
                <Folder class="h-5 w-5 fill-blue-500/20 text-blue-500" />
              {:else}
                <FileText class="h-5 w-5 text-muted-foreground" />
              {/if}
            </Table.Cell>
            <Table.Cell class="font-medium">{item.name}</Table.Cell>
            <Table.Cell class="text-sm text-muted-foreground">{formatBytes(item.size)}</Table.Cell>
            <Table.Cell class="text-sm text-muted-foreground">{dateFormatter.format(item.lastModified)}</Table.Cell>
            <Table.Cell class="text-right">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  {#snippet child({ props })}
                    <Button {...props} variant="ghost" size="icon" class="h-8 w-8" onclick={(e) => e.stopPropagation()}>
                      <Ellipsis class="h-4 w-4" />
                      <span class="sr-only">Open menu</span>
                    </Button>
                  {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  {#if item.type === "file"}
                    <DropdownMenu.Item onclick={() => onFileClick(item)}>
                      <SquarePen class="mr-2 h-4 w-4" /> View / Edit
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onclick={() => onDownload(item)}>
                      <Download class="mr-2 h-4 w-4" /> Download
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                  {/if}
                  <DropdownMenu.Item
                    class="text-destructive focus:text-destructive"
                    onclick={() => onDeleteClick(item)}
                  >
                    <Trash2 class="mr-2 h-4 w-4" /> Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Table.Cell>
          </Table.Row>
        {/each}
      {/if}
    </Table.Body>
  </Table.Root>
</div>
