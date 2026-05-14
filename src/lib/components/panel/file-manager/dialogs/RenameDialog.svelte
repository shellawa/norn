<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import type { FileItem } from "$lib/types"

  let {
    rename = $bindable(),
    onRenameItem
  }: {
    rename: { open: boolean; item: FileItem | null; name: string }
    onRenameItem: () => Promise<void>
  } = $props()
</script>

<Dialog.Root bind:open={rename.open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Rename {rename.item?.name}</Dialog.Title>
    </Dialog.Header>
    <div class="py-4">
      <Input placeholder="New name" bind:value={rename.name} onkeydown={(e) => e.key === "Enter" && onRenameItem()} />
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (rename = { open: false, item: null, name: "" })}>Cancel</Button>
      <Button onclick={onRenameItem} disabled={!rename.item || !rename.name.trim()}>Rename</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
