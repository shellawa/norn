<script lang="ts">
  import { Checkbox } from "$lib/components/shadcn-svelte/checkbox"
  import { Label } from "$lib/components/shadcn-svelte/label"

  let {
    form,
    generatedJvmFlags,
    generatedServerProperties,
    getProviderName
  }: {
    form: {
      name: string
      providerId: string
      version: string
      build: string
      eulaAccepted: boolean
    }
    generatedJvmFlags: string
    generatedServerProperties: string
    getProviderName: (id: string) => string | undefined
  } = $props()
</script>

<div class="space-y-4 text-sm">
  <div class="rounded-lg border bg-muted/30 p-4">
    <div class="font-medium">{form.name}</div>
    <div class="text-muted-foreground">{getProviderName(form.providerId)} {form.version} #{form.build}</div>
  </div>
  <div class="space-y-2">
    <Label>Generated JVM Flags</Label>
    <pre
      class="overflow-x-auto rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs break-all whitespace-pre-wrap">{generatedJvmFlags}</pre>
  </div>
  <div class="space-y-2">
    <Label>Generated server.properties</Label>
    <pre
      class="overflow-x-auto rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs whitespace-pre-wrap">{generatedServerProperties}</pre>
  </div>
  <div class="flex items-center space-x-2">
    <Checkbox id="eula-accepted" bind:checked={form.eulaAccepted} />
    <Label for="eula-accepted">Accept eula.txt</Label>
  </div>
</div>
