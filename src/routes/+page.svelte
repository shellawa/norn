<script lang="ts">
  import { Badge } from "$lib/components/shadcn-svelte/badge"
  import ServerCreationDialog from "$lib/components/panel/dashboard/ServerCreationDialog.svelte"
  import { serverStatusVariant } from "$lib/utils/server"

  let { data } = $props()

  const servers = $derived(data.servers)
  const providers = $derived(data.providers)

</script>

<main class="mx-auto w-full max-w-7xl space-y-6 px-6 py-6">
  <div class="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
    <h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>

    <ServerCreationDialog {providers} />
  </div>

  <div class="space-y-3">
    {#if servers.length === 0}
      <div class="rounded-xl border bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-sm">
        No servers yet. Create one to get started.
      </div>
    {:else}
      <div class="space-y-3">
        {#each servers as server (server.info.id)}
          <a
            href={`/servers/${server.info.id}`}
            class="group block rounded-xl border bg-card px-6 py-4 text-card-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div class="min-w-0 space-y-1">
                <div class="leading-none font-medium">{server.info.name}</div>
                <div class="truncate text-sm text-muted-foreground">{server.info.id}</div>
              </div>

              <div class="flex items-center gap-3">
                <Badge variant={serverStatusVariant(server.status)} class="capitalize">
                  {server.status}
                </Badge>
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</main>
