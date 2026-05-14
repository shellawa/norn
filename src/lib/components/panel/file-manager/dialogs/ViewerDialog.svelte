<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import CodeMirror from "svelte-codemirror-editor"
  import { oneDark } from "@codemirror/theme-one-dark"

  let {
    viewer = $bindable(),
    onSaveFile
  }: {
    viewer: { open: boolean; name: string; content: string }
    onSaveFile: (name: string, content: string) => Promise<void>
  } = $props()
</script>

<Dialog.Root bind:open={viewer.open}>
  <Dialog.Content class="flex h-[85vh] w-[95vw] max-w-none flex-col p-6 sm:max-w-250">
    <Dialog.Header>
      <Dialog.Title>{viewer.name}</Dialog.Title>
    </Dialog.Header>

    <div class="w-full flex-1 overflow-scroll rounded-md border border-input bg-[#282c34]">
      <CodeMirror
        bind:value={viewer.content}
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
      <Button variant="outline" onclick={() => (viewer.open = false)}>Cancel</Button>
      <Button onclick={() => onSaveFile(viewer.name, viewer.content)}>Save Changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
