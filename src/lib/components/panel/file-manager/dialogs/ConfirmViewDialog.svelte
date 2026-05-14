<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import type { FileItem } from "$lib/types"

  let {
    confirmView = $bindable(),
    onConfirmView
  }: {
    confirmView: { open: boolean; item: FileItem | null }
    onConfirmView: (item: FileItem) => Promise<void>
  } = $props()
</script>

<Dialog.Root bind:open={confirmView.open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>View {confirmView.item?.name}?</Dialog.Title>
      <Dialog.Description>
        This file does not appear to be a standard text file. Loading binary files might cause lag or display unreadable
        characters.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (confirmView.open = false)}>Cancel</Button>
      <Button onclick={() => confirmView.item && onConfirmView(confirmView.item)}>View Anyway</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
