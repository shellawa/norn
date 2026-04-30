<script lang="ts">
  import * as Card from "$lib/components/shadcn-svelte/card"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Label } from "$lib/components/shadcn-svelte/label"
  import { Checkbox } from "$lib/components/shadcn-svelte/checkbox"
  import * as Select from "$lib/components/shadcn-svelte/select"
  import type { McServerState } from "$lib/types"
  import { getContext } from "svelte"

  const serverState = getContext<McServerState>("serverState")

  let saving = $state(false)
  let saveError = $state("")
  let savedAt = $state<number | null>(null)

  let form = $state({
    name: serverState.info.name,
    host: serverState.info.host ?? "127.0.0.1",
    port: serverState.info.port ?? 25565,
    minMem: serverState.info.minMem ?? "1024M",
    maxMem: serverState.info.maxMem ?? "4096M",
    javaVersion: serverState.info.javaVersion ?? 25,
    jvmArgs: serverState.info.jvmArgs ?? "",
    maxPlayers: serverState.info.maxPlayers ?? 20,
    motd: serverState.info.motd ?? "A Minecraft Server",
    seed: serverState.info.seed ?? "",
    difficulty: serverState.info.difficulty ?? "normal",
    gamemode: serverState.info.gamemode ?? "survival",
    spawnProtection: serverState.info.spawnProtection ?? 16,
    offlineMode: serverState.info.offlineMode ?? false,
    pvp: serverState.info.pvp ?? true,
    allowFlight: serverState.info.allowFlight ?? false
  })

  const save = async () => {
    saving = true
    saveError = ""
    try {
      const res = await fetch(`/api/servers/${encodeURIComponent(serverState.info.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (!res.ok) {
        const body = (await res.json()) as { error?: string }
        throw new Error(body.error || "Failed to save")
      }

      const updated = (await res.json()) as McServerState["info"]
      Object.assign(serverState.info, updated)
      savedAt = Date.now()
    } catch (error) {
      saveError = error instanceof Error ? error.message : "Failed to save"
    } finally {
      saving = false
    }
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Configuration</Card.Title>
  </Card.Header>
  <Card.Content class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="name">Server Name</Label>
        <Input id="name" bind:value={form.name} />
      </div>
      <div class="space-y-2">
        <Label for="host">Connect Host/IP</Label>
        <Input id="host" bind:value={form.host} />
      </div>
      <div class="space-y-2">
        <Label for="port">Port</Label>
        <Input id="port" type="number" bind:value={form.port} />
      </div>
      <div class="space-y-2">
        <Label for="maxPlayers">Max Players</Label>
        <Input id="maxPlayers" type="number" bind:value={form.maxPlayers} />
      </div>
      <div class="space-y-2">
        <Label for="minMem">Min Memory</Label>
        <Input id="minMem" bind:value={form.minMem} />
      </div>
      <div class="space-y-2">
        <Label for="maxMem">Max Memory</Label>
        <Input id="maxMem" bind:value={form.maxMem} />
      </div>
      <div class="space-y-2 md:col-span-2">
        <Label for="javaVersion">Java Version</Label>
        <Input id="javaVersion" type="number" bind:value={form.javaVersion} />
      </div>
      <div class="space-y-2 md:col-span-2">
        <Label for="jvmArgs">JVM Args</Label>
        <Input id="jvmArgs" bind:value={form.jvmArgs} />
      </div>
      <div class="space-y-2 md:col-span-2">
        <Label for="motd">MOTD</Label>
        <Input id="motd" bind:value={form.motd} />
      </div>
      <div class="space-y-2">
        <Label for="seed">World Seed</Label>
        <Input id="seed" bind:value={form.seed} />
      </div>
      <div class="space-y-2">
        <Label for="spawnProtection">Spawn Protection</Label>
        <Input id="spawnProtection" type="number" bind:value={form.spawnProtection} />
      </div>
      <div class="space-y-2">
        <Label>Difficulty</Label>
        <Select.Root type="single" bind:value={form.difficulty}>
          <Select.Trigger class="w-full">{form.difficulty}</Select.Trigger>
          <Select.Content>
            <Select.Item value="peaceful">peaceful</Select.Item>
            <Select.Item value="easy">easy</Select.Item>
            <Select.Item value="normal">normal</Select.Item>
            <Select.Item value="hard">hard</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
      <div class="space-y-2">
        <Label>Gamemode</Label>
        <Select.Root type="single" bind:value={form.gamemode}>
          <Select.Trigger class="w-full">{form.gamemode}</Select.Trigger>
          <Select.Content>
            <Select.Item value="survival">survival</Select.Item>
            <Select.Item value="creative">creative</Select.Item>
            <Select.Item value="adventure">adventure</Select.Item>
            <Select.Item value="spectator">spectator</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="flex items-center gap-2">
        <Checkbox id="offlineMode" bind:checked={form.offlineMode} />
        <Label for="offlineMode">Offline Mode</Label>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="pvp" bind:checked={form.pvp} />
        <Label for="pvp">Enable PVP</Label>
      </div>
      <div class="flex items-center gap-2">
        <Checkbox id="allowFlight" bind:checked={form.allowFlight} />
        <Label for="allowFlight">Allow Flight</Label>
      </div>
    </div>
  </Card.Content>
  <Card.Footer class="items-center justify-end gap-4">
    {#if saveError}
      <p class="text-sm text-destructive">{saveError}</p>
    {:else if savedAt}
      <p class="text-sm text-muted-foreground">Saved at {new Date(savedAt).toLocaleTimeString()}</p>
    {/if}
    <Button onclick={save} disabled={saving}>{saving ? "Saving..." : "Save Configuration"}</Button>
  </Card.Footer>
</Card.Root>
