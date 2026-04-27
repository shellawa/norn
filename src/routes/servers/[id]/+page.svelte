<script lang="ts">
  import * as Tabs from "$lib/components/shadcn-svelte/tabs"
  import * as Card from "$lib/components/shadcn-svelte/card"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { Badge } from "$lib/components/shadcn-svelte/badge"
  import { source, type Source } from "sveltekit-sse"
  import { McServerStatus } from "$lib/types"
  import { onMount } from "svelte"
  import { Play, Square } from "lucide-svelte"
  import Overview from "$lib/components/panel/tabs/OverviewTab.svelte"
  import Console from "$lib/components/panel/tabs/ConsoleTab.svelte"

  let { data } = $props()

  // svelte-ignore state_referenced_locally
  let serverState = $state(structuredClone(data.serverState))

  let connection: Source
  onMount(() => {
    connection = source(`/api/servers/${encodeURIComponent(serverState.info.id)}/stream`, {
      close({ connect }) {
        console.log("reconnecting sse")
        connect()
      }
    })

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

  let statusVariant: "default" | "destructive" | "secondary" = $derived(
    serverState.status === McServerStatus.Running
      ? "default"
      : serverState.status === McServerStatus.Stopped
        ? "destructive"
        : "secondary"
  )
</script>

<main class="mx-auto w-full max-w-7xl space-y-6 p-6">
  <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">{serverState.info.name}</h1>
      <div class="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Current Status:</span>
        <Badge variant={statusVariant} class="capitalize">
          {serverState.status || "Unknown"}
        </Badge>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Button onclick={startServer} variant="default" size="sm">
        <Play class="mr-2 h-4 w-4" /> Start Server
      </Button>
      <Button onclick={stopServer} variant="destructive" size="sm">
        <Square class="mr-2 h-4 w-4" /> Stop Server
      </Button>
    </div>
  </div>

  <Tabs.Root value="overview" class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-4 bg-card md:inline-grid md:w-auto">
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="console">Console</Tabs.Trigger>
      <Tabs.Trigger value="file">Files</Tabs.Trigger>
      <Tabs.Trigger value="config">Configuration</Tabs.Trigger>
    </Tabs.List>

    <Overview {serverState} />

    <Console {serverState} />

    <Tabs.Content value="file" class="outline-none">
      <Card.Root>
        <Card.Header>
          <Card.Title>File Manager</Card.Title>
        </Card.Header>
        <Card.Content>File here</Card.Content>
      </Card.Root>
    </Tabs.Content>

    <Tabs.Content value="config" class="outline-none">
      <Card.Root>
        <Card.Header>
          <Card.Title>Server Configuration</Card.Title>
        </Card.Header>
        <Card.Content>Config here</Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</main>
