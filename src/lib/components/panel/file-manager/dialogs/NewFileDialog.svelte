<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Button } from "$lib/components/shadcn-svelte/button"

  let {
    newFile = $bindable(),
    onCreateFile
  }: {
    newFile: { open: boolean; name: string }
    onCreateFile: () => Promise<void>
  } = $props()
</script>

<Dialog.Root bind:open={newFile.open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create New File</Dialog.Title>
    </Dialog.Header>
    <div class="space-y-3 py-4">
      <Input
        placeholder="File name"
        bind:value={newFile.name}
        onkeydown={(e) => e.key === "Enter" && onCreateFile()}
      />
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (newFile = { open: false, name: "" })}>Cancel</Button>
      <Button onclick={onCreateFile} disabled={!newFile.name.trim()}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
