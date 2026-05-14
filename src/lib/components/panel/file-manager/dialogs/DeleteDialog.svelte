<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import type { FileItem } from "$lib/types"

  let {
    deleteDialog = $bindable(),
    onDeleteItem
  }: {
    deleteDialog: { open: boolean; item: FileItem | null }
    onDeleteItem: () => Promise<void>
  } = $props()
</script>

<Dialog.Root bind:open={deleteDialog.open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete {deleteDialog.item?.name}?</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete this {deleteDialog.item?.type}? This action cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (deleteDialog.open = false)}>Cancel</Button>
      <Button variant="destructive" onclick={onDeleteItem}>Delete</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
