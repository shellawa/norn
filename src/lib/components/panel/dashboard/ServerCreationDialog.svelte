<script lang="ts">
  import * as Dialog from "$lib/components/shadcn-svelte/dialog"
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { goto, invalidateAll } from "$app/navigation"
  import type { Version } from "$lib/server/providers/types"
  import { untrack } from "svelte"
  import { createDefaultServerForm, JVM_TEMPLATES, TOTAL_STEPS } from "./server-creation-config"
  import ServerCreationStepJar from "./ServerCreationStepJar.svelte"
  import ServerCreationStepJava from "./ServerCreationStepJava.svelte"
  import ServerCreationStepConfig from "./ServerCreationStepConfig.svelte"
  import ServerCreationStepReview from "./ServerCreationStepReview.svelte"

  let { providers }: { providers: { id: string; name: string }[] } = $props()
  let open = $state(false)
  let step = $state(1)
  let busy = $state(false)
  let error = $state("")
  let creatingStatus = $state("")

  let versions: Version[] = $state([])
  let builds: string[] = $state([])
  let showSnapshots = $state(false)
  let filteredVersions = $derived(versions.filter((v) => showSnapshots || v.type === "release"))
  let form = $state(createDefaultServerForm())

  const getProviderName = (id: string) => providers.find((p) => p.id === id)?.name
  const generatedJvmFlags = $derived(`-Xms${form.minMem} -Xmx${form.maxMem} ${form.jvmArgs}`.trim())
  const generatedServerProperties = $derived.by(() =>
    [
      `motd=${form.motd}`,
      `gamemode=${form.gamemode}`,
      `difficulty=${form.difficulty}`,
      `pvp=${form.pvp}`,
      `allow-flight=${form.allowFlight}`,
      `online-mode=${!form.offlineMode}`,
      `server-port=${form.port}`,
      `max-players=${form.maxPlayers}`,
      `spawn-protection=${form.spawnProtection}`,
      `level-seed=${form.seed}`
    ].join("\n")
  )

  const canGoNext = $derived.by(() => {
    if (busy) return false

    switch (step) {
      case 1:
        return Boolean(form.name && form.providerId && form.version && form.build)
      case 2:
        return Boolean(form.minMem && form.maxMem && form.javaVersion)
      case 3:
        return Boolean(form.port && form.maxPlayers !== undefined)
      default:
        return true
    }
  })

  const resetDialogState = () => {
    step = 1
    busy = false
    error = ""
    creatingStatus = ""
    versions = []
    builds = []
    form = createDefaultServerForm()
  }

  $effect(() => {
    if (open) {
      untrack(() => {
        if (providers.length > 0 && !form.providerId) {
          handleProviderChange(providers[0].id)
        }
      })
    } else {
      untrack(resetDialogState)
    }
  })

  $effect(() => {
    if (filteredVersions.length > 0 && !filteredVersions.find((v) => v.id === form.version)) {
      handleVersionChange(filteredVersions[0].id)
    }
  })

  const loadVersions = async (providerId: string) => {
    versions = []
    builds = []
    form.version = ""
    form.build = ""
    busy = true
    error = ""
    try {
      const res = await fetch(`/api/servers/create/providers/${encodeURIComponent(providerId)}/versions`)
      if (!res.ok) throw new Error("Failed to load versions")
      const data = (await res.json()) as Version[]
      versions = data
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load versions."
    } finally {
      busy = false
    }
  }

  const loadBuilds = async (providerId: string, version: string) => {
    if (!version) return
    builds = []
    form.build = ""
    busy = true
    error = ""
    try {
      const res = await fetch(
        `/api/servers/create/providers/${encodeURIComponent(providerId)}/versions/${encodeURIComponent(version)}/builds`
      )
      if (!res.ok) throw new Error("Failed to load builds")
      const data = (await res.json()) as string[]
      builds = data
      if (builds.length) form.build = builds[0]
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load builds."
    } finally {
      busy = false
    }
  }

  const handleProviderChange = (newProviderId: string) => {
    if (!newProviderId) return
    form.providerId = newProviderId
    loadVersions(newProviderId)
  }

  const handleVersionChange = (newVersion: string) => {
    if (!newVersion) return
    form.version = newVersion
    const selectedV = versions.find((v) => v.id === newVersion)
    if (selectedV?.javaVersion) form.javaVersion = String(selectedV.javaVersion)
    loadBuilds(form.providerId, newVersion)
  }

  const applyJvmTemplate = (templateId: string) => {
    const template = JVM_TEMPLATES.find((x) => x.id === templateId)
    if (!template) return
    form.jvmTemplate = template.id
    form.jvmArgs = template.args
  }

  const createServer = async () => {
    busy = true
    error = ""
    creatingStatus = "Creating server directory..."
    try {
      const payload = { ...form }
      const req = fetch("/api/servers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      })
      creatingStatus = "Downloading and creating server...(This can take a while)"
      const res = await req
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(payload.error ?? "Failed to create server.")
      }
      creatingStatus = "Finishing setup..."
      const created = (await res.json()) as { id: string }
      await invalidateAll()
      open = false
      await goto(`/servers/${created.id}/overview`)
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create server."
    } finally {
      creatingStatus = ""
      busy = false
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>{#snippet child({ props })}<Button {...props}>Create New Server</Button>{/snippet}</Dialog.Trigger>
  <Dialog.Content class="sm:max-w-137.5">
    <Dialog.Header><Dialog.Title>Create Server</Dialog.Title></Dialog.Header>
    {#if error}<div class="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        {error}
      </div>{/if}
    {#if busy && creatingStatus}<div class="rounded-md border bg-muted px-3 py-2 text-sm">{creatingStatus}</div>{/if}

    <div class="py-2">
      {#if step === 1}
        <ServerCreationStepJar
          {form}
          {providers}
          {versions}
          {builds}
          bind:showSnapshots
          {busy}
          {getProviderName}
          {handleProviderChange}
          {handleVersionChange}
        />
      {:else if step === 2}
        <ServerCreationStepJava {form} {applyJvmTemplate} />
      {:else if step === 3}
        <ServerCreationStepConfig {form} />
      {:else}
        <ServerCreationStepReview {form} {generatedJvmFlags} {generatedServerProperties} {getProviderName} />
      {/if}
    </div>

    <Dialog.Footer>
      <div>
        {#if step > 1}<Button variant="outline" onclick={() => step--}>Back</Button>{/if}
      </div>
      <div>
        {#if step < TOTAL_STEPS}
          <Button onclick={() => step++} disabled={!canGoNext}>Next Step</Button>
        {:else}
          <Button onclick={createServer} disabled={busy || !form.eulaAccepted}>Finish & Create</Button>
        {/if}
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
