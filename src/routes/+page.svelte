<script lang="ts">
  import * as Card from "$lib/components/shadcn-svelte/card"

  let { data } = $props()
</script>

<main class="mx-auto w-full max-w-7xl space-y-6 px-6">
  <div>
    <h1 class="text-2xl font-semibold">Servers</h1>
    <p class="text-sm text-muted-foreground">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odit, harum.</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {#each data.servers as server}
      <a href={`/servers/${server.info.id}`}>
        <Card.Root class="h-full transition hover:border-primary/40 hover:bg-accent/40">
          <Card.Header>
            <Card.Title>{server.info.name}</Card.Title>
            <Card.Description>{server.info.id}</Card.Description>
          </Card.Header>
          <Card.Content class="space-y-2 text-sm">
            <div><span class="font-medium">Status:</span> {server.status}</div>
          </Card.Content>
        </Card.Root>
      </a>
    {/each}
  </div>
</main>
