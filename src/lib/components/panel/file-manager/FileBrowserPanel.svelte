<script lang="ts">
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import * as Breadcrumb from "$lib/components/shadcn-svelte/breadcrumb"
  import * as Pagination from "$lib/components/shadcn-svelte/pagination"
  import { ChevronLeft } from "lucide-svelte"
  import type { FileItem } from "$lib/types"
  import FileTable from "./FileTable.svelte"

  let {
    items,
    segments,
    mode = "default",
    searchQuery = $bindable(""),
    currentPage = $bindable(1),
    itemsPerPage = 50,
    backDisabled = false,
    searchPlaceholder = "Search...",
    onBack,
    onCrumbNavigate,
    onNavigate,
    onFileClick,
    onDownload,
    onDeleteClick,
    onMoveClick,
    onRenameClick,
    toolbarActions
  }: {
    items: FileItem[]
    segments: string[]
    mode?: "default" | "picker"
    searchQuery?: string
    currentPage?: number
    itemsPerPage?: number
    backDisabled?: boolean
    searchPlaceholder?: string
    onBack: () => void
    onCrumbNavigate: (path: string) => void
    onNavigate: (item: FileItem) => void
    onFileClick: (item: FileItem) => void
    onDownload: (item: FileItem) => void
    onDeleteClick: (item: FileItem) => void
    onMoveClick: (item: FileItem) => void
    onRenameClick: (item: FileItem) => void
    toolbarActions?: import("svelte").Snippet
  } = $props()

  let filtered = $derived(
    items
      .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "directory" ? -1 : 1))
  )
  let paginated = $derived(filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
</script>

<div class="space-y-4">
  <div class="flex items-center gap-4">
    <Button variant="outline" size="icon" class="h-8 w-8" disabled={backDisabled} onclick={onBack}>
      <ChevronLeft class="h-4 w-4" />
      <span class="sr-only">Go back</span>
    </Button>

    <Breadcrumb.Root>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          {#if segments.length === 0}
            <Breadcrumb.Page>
              <div class="m-4">/</div>
            </Breadcrumb.Page>
          {:else}
            <Breadcrumb.Link
              href="#"
              onclick={(e) => {
                e.preventDefault()
                onCrumbNavigate("")
              }}
            >
              <div class="m-4">/</div>
            </Breadcrumb.Link>
          {/if}
        </Breadcrumb.Item>
        {#each segments as segment, i}
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            {#if i === segments.length - 1}
              <Breadcrumb.Page>{segment}</Breadcrumb.Page>
            {:else}
              <Breadcrumb.Link
                href="#"
                onclick={(e) => {
                  e.preventDefault()
                  onCrumbNavigate(segments.slice(0, i + 1).join("/"))
                }}
              >
                {segment}
              </Breadcrumb.Link>
            {/if}
          </Breadcrumb.Item>
        {/each}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  </div>

  <div class="flex items-center justify-between gap-4">
    <Input
      placeholder={searchPlaceholder}
      class="max-w-sm"
      bind:value={searchQuery}
      oninput={() => (currentPage = 1)}
    />
    {#if toolbarActions}
      <div class="space-x-2">{@render toolbarActions()}</div>
    {/if}
  </div>

  <FileTable
    {mode}
    items={paginated}
    isFilteredEmpty={filtered.length === 0}
    {onNavigate}
    {onFileClick}
    {onDownload}
    {onDeleteClick}
    {onMoveClick}
    {onRenameClick}
  />

  {#if filtered.length > itemsPerPage}
    <Pagination.Root count={filtered.length} perPage={itemsPerPage} bind:page={currentPage}>
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
