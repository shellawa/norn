<script lang="ts">
  import * as Select from "$lib/components/shadcn-svelte/select"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Textarea } from "$lib/components/shadcn-svelte/textarea"
  import { Label } from "$lib/components/shadcn-svelte/label"
  import { JVM_TEMPLATES } from "./server-creation-config"

  let {
    form,
    applyJvmTemplate
  }: {
    form: {
      javaVersion: string
      minMem: string
      maxMem: string
      jvmTemplate: string
      jvmArgs: string
    }
    applyJvmTemplate: (templateId: string) => void
  } = $props()
</script>

<div class="space-y-4">
  <div class="space-y-2">
    <Label for="java">Java Version</Label>
    <Input id="java" bind:value={form.javaVersion} />
  </div>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label for="minMem">Min Memory (Xms)</Label>
      <Input id="minMem" bind:value={form.minMem} />
    </div>
    <div class="space-y-2">
      <Label for="maxMem">Max Memory (Xmx)</Label>
      <Input id="maxMem" bind:value={form.maxMem} />
    </div>
  </div>
  <div class="space-y-2">
    <Label>JVM Template</Label>
    <Select.Root type="single" bind:value={form.jvmTemplate} onValueChange={applyJvmTemplate}>
      <Select.Trigger class="w-full">
        {JVM_TEMPLATES.find((x) => x.id === form.jvmTemplate)?.label || "Select template"}
      </Select.Trigger>
      <Select.Content>
        {#each JVM_TEMPLATES as template}
          <Select.Item value={template.id}>{template.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
  <div class="space-y-2">
    <Label for="jvmArgs">JVM Arguments</Label>
    <Textarea id="jvmArgs" bind:value={form.jvmArgs} rows={4} />
  </div>
</div>
