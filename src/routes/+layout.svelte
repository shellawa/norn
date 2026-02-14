<script lang="ts">
  import "./layout.css"
  import favicon from "$lib/assets/favicon.svg"

  import * as Sidebar from "$lib/components/shadcn-svelte/sidebar/index.js"
  import AppSidebar from "$lib/components/shadcn-svelte/app-sidebar.svelte"

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Sidebar.Provider>
  <AppSidebar />
  <div class="h-full w-full space-y-4">
    <nav class="flex h-6 w-full items-center border-b py-6">
      <Sidebar.Trigger />
    </nav>
    {@render children?.()}
  </div>
</Sidebar.Provider>
