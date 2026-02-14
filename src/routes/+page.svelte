<script lang="ts">
  import * as Tabs from "$lib/components/shadcn-svelte/tabs"
  import * as Card from "$lib/components/shadcn-svelte/card"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { source } from "sveltekit-sse"
  import type { McServerStatus } from "$lib/types"
  import { onMount } from "svelte"

  let { data } = $props()
  // svelte-ignore state_referenced_locally
  let history = $state(data.history)
  // svelte-ignore state_referenced_locally
  let status = $state(data.status)

  onMount(() => {
    const connection = source("/api/server/stream")
    connection.select("log").subscribe((val) => history.push(val))
    connection.select("status").subscribe((val) => {
      if (val) status = val as McServerStatus
    })
  })

  const sendCommand = async (cmd: "START" | "STOP") => {
    await fetch("/api/server", {
      method: "POST",
      body: JSON.stringify({ command: cmd }),
      headers: { "Content-Type": "application/json" }
    })
  }
</script>

<main class="mx-auto w-full max-w-7xl space-y-4 px-6">
  <div class="text-2xl font-semibold">Title of the server</div>
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
      <div>
        <Button onclick={() => sendCommand("START")}>Start</Button>
        <Button onclick={() => sendCommand("STOP")}>Stop</Button>
        <div>Status: {status}</div>
        {#each history as line}
          <div>{line}</div>
        {/each}
      </div>
    </Tabs.Content>
    <Tabs.Content value="console">Console here</Tabs.Content>
    <Tabs.Content value="file">File here</Tabs.Content>
    <Tabs.Content value="config">Config here</Tabs.Content>
  </Tabs.Root>
</main>
