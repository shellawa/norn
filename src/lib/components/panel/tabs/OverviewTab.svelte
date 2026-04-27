<script lang="ts">
  import * as Card from "$lib/components/shadcn-svelte/card"
  import * as Tabs from "$lib/components/shadcn-svelte/tabs"
  import type { McServerState } from "$lib/types"
  import { Users, Cpu, MemoryStick, Clock, Activity, Terminal } from "lucide-svelte"

  const mockMetrics = {
    players: "12 / 20",
    cpu: "34.2%",
    ram: "4.2 GB / 8 GB",
    uptime: "2d 14h 32m"
  }

  let { serverState }: { serverState: McServerState } = $props()

  let scrollContainer: HTMLDivElement | undefined = $state()
  let isAutoScrollEnabled = true

  const handleScroll = () => {
    if (!scrollContainer) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    isAutoScrollEnabled = Math.abs(scrollHeight - clientHeight - scrollTop) < 10
  }

  const scrollToBottom = () => {
    if (isAutoScrollEnabled && scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }

  $effect(() => {
    serverState.logs.length
    scrollToBottom()
  })

  $effect(() => {
    if (!scrollContainer) return
    const observer = new ResizeObserver(() => {
      scrollToBottom()
    })

    observer.observe(scrollContainer)

    return () => observer.disconnect()
  })
</script>

<Tabs.Content value="overview" class="space-y-4 outline-none">
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Players Online</Card.Title>
        <Users class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{mockMetrics.players}</div>
        <p class="text-xs text-muted-foreground">+2 in the last hour</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">CPU Usage</Card.Title>
        <Cpu class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{mockMetrics.cpu}</div>
        <p class="text-xs text-muted-foreground">Normal load</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Memory Allocation</Card.Title>
        <MemoryStick class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{mockMetrics.ram}</div>
        <p class="text-xs text-muted-foreground">52% utilization</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Uptime</Card.Title>
        <Clock class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{mockMetrics.uptime}</div>
        <p class="text-xs text-muted-foreground">Since last restart</p>
      </Card.Content>
    </Card.Root>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <Card.Root class="lg:col-span-4">
      <Card.Header>
        <Card.Title>Graph thingy</Card.Title>
        <Card.Description>Lorem ipsum dolor sit amet, consectetur adipisicing.</Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="flex h-62.5 w-full items-center justify-center rounded-md border border-dashed bg-muted/30">
          <div class="flex flex-col items-center text-muted-foreground">
            <Activity class="mb-2 h-8 w-8 opacity-50" />
            <span class="text-sm">Graph goes here</span>
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="lg:col-span-3">
      <Card.Header>
        <Card.Title>Logs</Card.Title>
        <Card.Description>Lorem ipsum dolor sit amet, consectetur adipisicing.</Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="flex h-62.5 flex-col rounded-md bg-background p-4 shadow-inner">
          <div
            bind:this={scrollContainer}
            onscroll={handleScroll}
            class="flex-1 space-y-1 overflow-y-auto font-mono text-xs"
          >
            {#if serverState.logs.length}
              {#each serverState.logs as line}
                <div class="wrap-break-word">{line}</div>
              {/each}
            {:else}
              <div class="flex h-full items-center justify-center text-muted">
                <Terminal class="mr-2 h-4 w-4" /> Waiting for logs...
              </div>
            {/if}
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</Tabs.Content>
