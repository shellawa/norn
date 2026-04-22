<script lang="ts">
  import * as Tabs from "$lib/components/shadcn-svelte/tabs"
  import * as Card from "$lib/components/shadcn-svelte/card"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { source } from "sveltekit-sse"
  import type { McServerStatus } from "$lib/types"
  import { onMount } from "svelte"

  let { data } = $props()

  // svelte-ignore state_referenced_locally
  let serverState = $state(structuredClone(data.serverState))

  onMount(() => {
    const connection = source(`/api/servers/${encodeURIComponent(serverState.info.id)}/stream`)
    connection.select("log").subscribe((val) => {
      if (val) serverState.logs.push(val)
    })
    connection.select("status").subscribe((val) => {
      if (val) serverState.status = val as McServerStatus
    })
  })

  const startServer = async () => {
    await fetch(`/api/servers/${encodeURIComponent(serverState.info.id)}/start`)
  }

  const stopServer = async () => {
    await fetch(`/api/servers/${encodeURIComponent(serverState.info.id)}/stop`)
  }
</script>

<main class="mx-auto w-full max-w-7xl space-y-4 px-6">
  <div class="space-y-1">
    <div class="text-2xl font-semibold">{serverState.info.name}</div>
  </div>
  <Tabs.Root value="overview">
    <Card.Root class="flex w-fit items-center p-0.75">
      <Tabs.List class="bg-transparent">
        <Tabs.Trigger class="w-32" value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger class="w-32" value="console">Console</Tabs.Trigger>
        <Tabs.Trigger class="w-32" value="file">File</Tabs.Trigger>
        <Tabs.Trigger class="w-32" value="config">Config</Tabs.Trigger>
      </Tabs.List>
    </Card.Root>
    <Tabs.Content value="overview">
      <div class="space-y-3">
        <div class="flex gap-2">
          <Button onclick={startServer}>Start</Button>
          <Button onclick={stopServer}>Stop</Button>
        </div>
        <div>Status: {serverState.status}</div>
        <div class="rounded-lg border bg-card">
          <div class="max-h-150 space-y-0.5 overflow-scroll p-4 font-mono text-sm">
            {#if serverState.logs.length}
              {#each serverState.logs as line}
                <div>{line}</div>
              {/each}
            {:else}
              <div class="text-muted-foreground">No logs yet.</div>
            {/if}
          </div>
        </div>
      </div>
    </Tabs.Content>
    <Tabs.Content value="console">
      <Card.Root>
        <Card.Header>
          <Card.Title>Console</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-0.5 font-mono text-sm">
          {#if serverState.logs.length}
            {#each serverState.logs as line}
              <div>{line}</div>
            {/each}
          {:else}
            <div class="text-muted-foreground">No logs yet.</div>
          {/if}
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
    <Tabs.Content value="file">File here</Tabs.Content>
    <Tabs.Content value="config">Config here</Tabs.Content>
  </Tabs.Root>
</main>
