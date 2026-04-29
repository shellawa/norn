<script lang="ts">
  import * as Select from "$lib/components/shadcn-svelte/select"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Label } from "$lib/components/shadcn-svelte/label"
  import { Checkbox } from "$lib/components/shadcn-svelte/checkbox"
  import type { Version } from "$lib/server/providers/types"

  let {
    form,
    providers,
    versions,
    builds,
    showSnapshots = $bindable(),
    busy,
    getProviderName,
    handleProviderChange,
    handleVersionChange
  }: {
    form: {
      name: string
      providerId: string
      version: string
      build: string
    }
    providers: { id: string; name: string }[]
    versions: Version[]
    builds: string[]
    showSnapshots: boolean
    busy: boolean
    getProviderName: (id: string) => string | undefined
    handleProviderChange: (providerId: string) => void
    handleVersionChange: (version: string) => void
  } = $props()

  const filteredVersions = $derived(versions.filter((v) => showSnapshots || v.type === "release"))
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <Label for="name">Name</Label>
    <Input id="name" bind:value={form.name} />
  </div>
  <div class="grid gap-4 sm:grid-cols-3">
    <div class="space-y-2">
      <Label>Provider</Label>
      <Select.Root
        type="single"
        bind:value={form.providerId}
        onValueChange={handleProviderChange}
        disabled={busy || !providers.length}
      >
        <Select.Trigger class="w-full">{getProviderName(form.providerId) || "Select Provider"}</Select.Trigger>
        <Select.Content>
          {#each providers as provider}
            <Select.Item value={provider.id}>{provider.name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
    <div class="space-y-2">
      <Label>Version</Label>
      <Select.Root
        type="single"
        bind:value={form.version}
        onValueChange={handleVersionChange}
        disabled={busy || !filteredVersions.length}
      >
        <Select.Trigger class="w-full">{form.version || "Select Version"}</Select.Trigger>
        <Select.Content class="max-h-64 overflow-y-auto">
          {#each filteredVersions as v}
            <Select.Item value={v.id}>{v.id}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
    <div class="space-y-2">
      <Label>Build</Label>
      <Select.Root type="single" bind:value={form.build} disabled={busy || !builds.length}>
        <Select.Trigger class="w-full">{form.build || "Select Build"}</Select.Trigger>
        <Select.Content class="max-h-64 overflow-y-auto">
          {#each builds as b}
            <Select.Item value={b}>{b}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
  </div>
  <div class="flex items-center space-x-2">
    <Checkbox id="show-snapshots" bind:checked={showSnapshots} />
    <Label for="show-snapshots">Include snapshot/beta versions</Label>
  </div>
</div>
