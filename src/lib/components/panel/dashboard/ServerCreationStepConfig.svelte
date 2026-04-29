<script lang="ts">
  import * as Select from "$lib/components/shadcn-svelte/select"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Label } from "$lib/components/shadcn-svelte/label"
  import { Checkbox } from "$lib/components/shadcn-svelte/checkbox"
  import { DIFFICULTIES, GAMEMODES } from "./server-creation-config"

  let {
    form
  }: {
    form: {
      motd: string
      seed: string
      port: number
      maxPlayers: number
      difficulty: string
      gamemode: string
      spawnProtection: number
      offlineMode: boolean
      pvp: boolean
      allowFlight: boolean
    }
  } = $props()
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <Label for="motd">MOTD</Label>
    <Input id="motd" bind:value={form.motd} />
  </div>
  <div class="space-y-2">
    <Label for="seed">World Seed</Label>
    <Input id="seed" bind:value={form.seed} />
  </div>
  <div class="space-y-2">
    <Label for="port">Server Port</Label>
    <Input id="port" type="number" bind:value={form.port} />
  </div>
  <div class="space-y-2">
    <Label for="maxPlayers">Max Players</Label>
    <Input id="maxPlayers" type="number" bind:value={form.maxPlayers} />
  </div>
  <div class="space-y-2">
    <Label>Difficulty</Label>
    <Select.Root type="single" bind:value={form.difficulty}>
      <Select.Trigger class="w-full">{form.difficulty}</Select.Trigger>
      <Select.Content>
        {#each DIFFICULTIES as difficulty}
          <Select.Item value={difficulty}>{difficulty}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
  <div class="space-y-2">
    <Label>Gamemode</Label>
    <Select.Root type="single" bind:value={form.gamemode}>
      <Select.Trigger class="w-full">{form.gamemode}</Select.Trigger>
      <Select.Content>
        {#each GAMEMODES as gamemode}
          <Select.Item value={gamemode}>{gamemode}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
  <div class="space-y-2">
    <Label for="spawnProtection">Spawn Protection</Label>
    <Input id="spawnProtection" type="number" bind:value={form.spawnProtection} />
  </div>
  <div class="flex items-center space-x-2">
    <Checkbox id="offline-mode" bind:checked={form.offlineMode} />
    <Label for="offline-mode">Offline Mode</Label>
  </div>
  <div class="flex items-center space-x-2">
    <Checkbox id="pvp" bind:checked={form.pvp} />
    <Label for="pvp">Enable PVP</Label>
  </div>
  <div class="flex items-center space-x-2">
    <Checkbox id="allow-flight" bind:checked={form.allowFlight} />
    <Label for="allow-flight">Allow Flight</Label>
  </div>
</div>
