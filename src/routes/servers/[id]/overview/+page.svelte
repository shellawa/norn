<script lang="ts">
  import * as Card from "$lib/components/shadcn-svelte/card"
  import * as Chart from "$lib/components/shadcn-svelte/chart"
  import type { McServerState } from "$lib/types"
  import { Users, Cpu, MemoryStick, Clock, Activity, Terminal, HardDrive } from "lucide-svelte"
  import { AreaChart } from "layerchart"
  import { getContext } from "svelte"
  import { AnsiUp } from "ansi_up"

  const serverState: McServerState = getContext("serverState")

  const formatPercent = (value: number | null) => (value == null ? "n/a" : `${value.toFixed(1)}%`)
  const formatMb = (value: number | null) => (value == null ? "n/a" : `${value.toFixed(0)} MB`)
  const formatGb = (value: number | null) => (value == null ? "n/a" : `${(value / 1024).toFixed(2)} GB`)
  const formatUptime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / 86_400)
    const hours = Math.floor((totalSeconds % 86_400) / 3_600)
    const minutes = Math.floor((totalSeconds % 3_600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const chartConfig = {
    cpu: { label: "CPU %", color: "var(--chart-1)" },
    rss: { label: "RSS MB", color: "var(--chart-2)" }
  } satisfies Chart.ChartConfig

  const ansiUp = new AnsiUp()

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

<svelte:head>
  <title>Overview - {serverState.info.name}</title>
</svelte:head>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">Players Online</Card.Title>
      <Users class="h-4 w-4 text-muted-foreground" />
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{serverState.resource.sample.playerCount}</div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">CPU Usage</Card.Title>
      <Cpu class="h-4 w-4 text-muted-foreground" />
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{formatPercent(serverState.resource.sample.cpuPercent)}</div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">Memory (RSS)</Card.Title>
      <MemoryStick class="h-4 w-4 text-muted-foreground" />
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{formatMb(serverState.resource.sample.processRssMb)}</div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">Uptime</Card.Title>
      <Clock class="h-4 w-4 text-muted-foreground" />
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{formatUptime(serverState.resource.uptimeMs)}</div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title class="text-sm font-medium">Server Directory</Card.Title>
      <HardDrive class="h-4 w-4 text-muted-foreground" />
    </Card.Header>
    <Card.Content>
      <div class="text-2xl font-bold">{formatGb(serverState.resource.sample.serverDirSizeMb)}</div>
    </Card.Content>
  </Card.Root>
</div>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
  <Card.Root class="lg:col-span-4">
    <Card.Header>
      <Card.Title>Resource History</Card.Title>
    </Card.Header>
    <Card.Content>
      {@const cutoff = Date.now() - 90000}
      {@const chartData = serverState.resource.history
        .filter((x) => x.at >= cutoff)
        .map((x) => ({
          at: `-${Math.max(0, Math.floor((Date.now() - x.at) / 1000))}s`,
          cpu: x.cpuPercent ?? 0,
          rss: x.processRssMb ?? 0
        }))}
      {#if chartData.length}
        <div class="space-y-3">
          <Chart.Container config={chartConfig} class="hide-x-axis h-30 w-full">
            <AreaChart
              data={chartData}
              x="at"
              series={[{ key: "cpu", label: "CPU %", value: "cpu", color: "var(--color-cpu)" }]}
            />
          </Chart.Container>
          <Chart.Container config={chartConfig} class="hide-x-axis h-30 w-full">
            <AreaChart
              data={chartData}
              x="at"
              series={[{ key: "rss", label: "RSS MB", value: "rss", color: "var(--color-rss)" }]}
            />
          </Chart.Container>
        </div>
      {:else}
        <div class="flex h-62.5 w-full items-center justify-center rounded-md border border-dashed bg-muted/30">
          <div class="flex flex-col items-center text-muted-foreground">
            <Activity class="mb-2 h-8 w-8 opacity-50" />
            <span class="text-sm">Waiting for first resource samples...</span>
          </div>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root class="lg:col-span-3">
    <Card.Header>
      <Card.Title>Logs</Card.Title>
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
              <div class="wrap-break-word whitespace-pre-wrap">{@html ansiUp.ansi_to_html(line)}</div>
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

<style>
  :global(.hide-x-axis .lc-axis.placement-bottom .lc-axis-tick-label) {
    display: none;
  }
</style>
