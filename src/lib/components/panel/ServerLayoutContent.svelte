<script lang="ts">
  import * as Tabs from "$lib/components/shadcn-svelte/tabs"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { Badge } from "$lib/components/shadcn-svelte/badge"
  import { source, type Source } from "sveltekit-sse"
  import { McServerStatus, type McServerState } from "$lib/types"
  import { serverStatusVariant } from "$lib/utils/server"
  import { onDestroy, setContext, type Snippet } from "svelte"
  import { Play, Square } from "lucide-svelte"
  import { page } from "$app/state"
  import { goto } from "$app/navigation"

  let { data, children }: { data: { serverState: McServerState }; children: Snippet<[]> } = $props()

  // svelte-ignore state_referenced_locally
  const serverState = $state(structuredClone(data.serverState))
  setContext("serverState", serverState)

  const currentRoute = $derived(page.url.pathname.split("/").at(-1))

  const connection: Source = source(`/api/servers/${encodeURIComponent(serverState.info.id)}/stream`)
  const stopLog = connection.select("log").subscribe((val) => {
    if (val) serverState.logs.push(val)
  })
  const stopStatus = connection.select("status").subscribe((val) => {
    if (val) serverState.status = val as McServerStatus
  })

  onDestroy(() => {
    stopLog()
    stopStatus()
    connection.close()
  })

  const startServer = async () => {
    await fetch(`/api/servers/${encodeURIComponent(serverState.info.id)}/start`)
  }

  const stopServer = async () => {
    await fetch(`/api/servers/${encodeURIComponent(serverState.info.id)}/stop`)
  }
</script>

<main class="mx-auto w-full max-w-7xl space-y-6 p-6">
  <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">{serverState.info.name}</h1>
      <div class="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>Current Status:</span>
        <Badge variant={serverStatusVariant(serverState.status)} class="capitalize">
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

  <Tabs.Root value={currentRoute} class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-4 bg-card md:inline-grid md:w-auto">
      {@const serverRoot = `/servers/${serverState.info.id}/`}
      <Tabs.Trigger onclick={() => goto(serverRoot + "overview")} value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger onclick={() => goto(serverRoot + "console")} value="console">Console</Tabs.Trigger>
      <Tabs.Trigger onclick={() => goto(serverRoot + "file")} value="file">Files</Tabs.Trigger>
      <Tabs.Trigger onclick={() => goto(serverRoot + "config")} value="config">Configuration</Tabs.Trigger>
    </Tabs.List>
  </Tabs.Root>

  {@render children?.()}
</main>
