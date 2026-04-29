<script lang="ts">
  import { page } from "$app/state"
  import ServerLayoutContent from "$lib/components/panel/ServerLayoutContent.svelte"

  let { data, children } = $props()
  const currentServerId = $derived(page.params.id)
</script>

{#key currentServerId}
  <ServerLayoutContent {data} {children} />
{/key}
