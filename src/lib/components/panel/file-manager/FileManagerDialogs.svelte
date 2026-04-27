<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import type { FileItem, FileManagerDialogState } from "$lib/types"
  import CodeMirror from "svelte-codemirror-editor"
  import { oneDark } from "@codemirror/theme-one-dark"

  let {
    dialogs = $bindable(),
    onCreateFolder,
    onDeleteItem,
    onConfirmView,
    onSaveFile
  }: {
    dialogs: FileManagerDialogState
    onCreateFolder: () => Promise<void>
    onDeleteItem: () => Promise<void>
    onConfirmView: (item: FileItem) => Promise<void>
    onSaveFile: (name: string, content: string) => Promise<void>
  } = $props()
</script>

<Dialog.Root bind:open={dialogs.viewer.open}>
  <Dialog.Content class="flex h-[85vh] w-[95vw] max-w-none flex-col p-6 sm:max-w-250">
    <Dialog.Header>
      <Dialog.Title>{dialogs.viewer.name}</Dialog.Title>
    </Dialog.Header>

    <div class="w-full flex-1 overflow-scroll rounded-md border border-input bg-[#282c34]">
      <CodeMirror
        bind:value={dialogs.viewer.content}
        extensions={[oneDark]}
        styles={{
          "&": {
            width: "100%",
            height: "100%"
          }
        }}
      />
    </div>

    <Dialog.Footer class="mt-4">
      <Button variant="outline" onclick={() => (dialogs.viewer.open = false)}>Cancel</Button>
      <Button onclick={() => onSaveFile(dialogs.viewer.name, dialogs.viewer.content)}>Save Changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={dialogs.newFolder.open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create New Folder</Dialog.Title>
    </Dialog.Header>
    <div class="py-4">
      <Input
        placeholder="Folder name"
        bind:value={dialogs.newFolder.name}
        onkeydown={(e) => e.key === "Enter" && onCreateFolder()}
      />
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (dialogs.newFolder.open = false)}>Cancel</Button>
      <Button onclick={onCreateFolder} disabled={!dialogs.newFolder.name.trim()}>Create</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={dialogs.delete.open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Delete {dialogs.delete.item?.name}?</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete this {dialogs.delete.item?.type}? This action cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (dialogs.delete.open = false)}>Cancel</Button>
      <Button variant="destructive" onclick={onDeleteItem}>Delete</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={dialogs.confirmView.open}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>View {dialogs.confirmView.item?.name}?</Dialog.Title>
      <Dialog.Description>
        This file does not appear to be a standard text file. Loading binary files might cause lag or display unreadable
        characters.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (dialogs.confirmView.open = false)}>Cancel</Button>
      <Button onclick={() => dialogs.confirmView.item && onConfirmView(dialogs.confirmView.item)}>View Anyway</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
