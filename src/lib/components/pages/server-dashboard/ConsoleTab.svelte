<script lang="ts">
  import * as Card from "$lib/components/shadcn-svelte/card"
  import * as Tabs from "$lib/components/shadcn-svelte/tabs"
  import type { McServerState } from "$lib/types"
  import { Terminal } from "lucide-svelte"

  let { serverState }: { serverState: McServerState } = $props()

  let commandInput = $state("")
  let handleCommand = async () => {
    await fetch(`/api/servers/${encodeURIComponent(serverState.info.id)}/console-command`, {
      method: "POST",
      body: JSON.stringify({ cmd: commandInput })
    })
    commandInput = ""
  }
</script>

<Tabs.Content value="console" class="outline-none">
  <Card.Root class="flex flex-col gap-0 overflow-hidden border bg-transparent pt-4 pb-3">
    <Card.Content class="p-0">
      <div class="h-112.5 space-y-1 overflow-y-auto px-4 font-mono text-sm">
        {#if serverState.logs.length}
          {#each serverState.logs as line}
            <div class="wrap-break-word">{line}</div>
          {/each}
        {:else}
          <div class="flex h-full items-center justify-center">
            <Terminal class="mr-2 h-4 w-4" /> Waiting for logs...
          </div>
        {/if}
      </div>
    </Card.Content>

    <form
      onsubmit={(e) => {
        e.preventDefault()
        handleCommand()
      }}
      class="flex items-center border-t px-4 pt-3"
    >
      <span class="mr-3 font-mono text-sm text-muted-foreground">/</span>
      <input
        type="text"
        class="flex-1 font-mono text-sm outline-none placeholder:text-muted"
        placeholder="time set day"
        bind:value={commandInput}
        autocomplete="off"
        spellcheck="false"
      />
    </form>
  </Card.Root>
</Tabs.Content>
