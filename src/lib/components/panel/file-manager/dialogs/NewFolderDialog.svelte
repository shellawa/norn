<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Button } from "$lib/components/shadcn-svelte/button"

  let {
    newFolder = $bindable(),
    onCreateFolder
  }: {
    newFolder: { open: boolean; name: string }
    onCreateFolder: () => Promise<void>
  } = $props()
</script>

<Dialog.Root bind:open={newFolder.open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create New Folder</Dialog.Title>
    </Dialog.Header>
    <div class="py-4">
      <Input
        placeholder="Folder name"
        bind:value={newFolder.name}
        onkeydown={(e) => e.key === "Enter" && onCreateFolder()}
      />
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (newFolder.open = false)}>Cancel</Button>
      <Button onclick={onCreateFolder} disabled={!newFolder.name.trim()}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
