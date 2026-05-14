<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import FileBrowserPanel from "../FileBrowserPanel.svelte"
  import type { FileItem } from "$lib/types"

  let {
    move = $bindable(),
    onMoveItem,
    onMoveNavigate,
    onMoveBack,
    onMovePath
  }: {
    move: {
      open: boolean
      item: FileItem | null
      browserPath: string
      selectedFolder: string
      folders: FileItem[]
      loading: boolean
      error: string
    }
    onMoveItem: () => Promise<void>
    onMoveNavigate: (folder: FileItem) => Promise<void>
    onMoveBack: () => Promise<void>
    onMovePath: (path: string) => Promise<void>
  } = $props()

  let moveSegments = $derived(move.browserPath ? move.browserPath.split("/").filter(Boolean) : [])
  let moveUi = $state({
    searchQuery: "",
    currentPage: 1
  })
</script>

<Dialog.Root bind:open={move.open}>
  <Dialog.Content class="flex h-[85vh] w-[95vw] max-w-none flex-col p-4 sm:max-w-250">
    <Dialog.Header>
      <Dialog.Title>Move {move.item?.name}</Dialog.Title>
    </Dialog.Header>

    <div class="min-h-0 flex-1 py-2">
      <FileBrowserPanel
        mode="picker"
        items={move.folders}
        segments={moveSegments}
        bind:searchQuery={moveUi.searchQuery}
        bind:currentPage={moveUi.currentPage}
        backDisabled={!moveSegments.length}
        onBack={onMoveBack}
        onCrumbNavigate={onMovePath}
        onNavigate={onMoveNavigate}
        onFileClick={() => {}}
        onDownload={() => {}}
        onDeleteClick={() => {}}
        onMoveClick={() => {}}
        onRenameClick={() => {}}
      />
    </div>

    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() =>
          (move = {
            open: false,
            item: null,
            browserPath: "",
            selectedFolder: "",
            folders: [],
            loading: false,
            error: ""
          })}
      >
        Cancel
      </Button>
      <Button onclick={onMoveItem} disabled={!move.item || move.loading}>Move Here</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
