<script lang="ts">
  import "./layout.css"
  import favicon from "$lib/assets/favicon.ico"

  import * as Sidebar from "$lib/components/shadcn-svelte/sidebar/index.js"
  import AppSidebar from "$lib/components/shadcn-svelte/app-sidebar.svelte"
  import { page } from "$app/state"

  let { children, data } = $props()

  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"))
  const showAppShell = $derived(Boolean(data.user) && !isAuthRoute)
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if showAppShell}
  <Sidebar.Provider>
    <AppSidebar servers={data.servers} />
    <div class="h-full w-full space-y-4">
      <nav class="flex h-6 w-full items-center justify-between border-b px-4 py-6">
        <Sidebar.Trigger />
        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{data.servers?.length ?? 0} servers</span>
          <span>{data.user?.username}</span>
          <a href="/api/auth/logout" class="text-foreground underline-offset-4 hover:underline">Logout</a>
        </div>
      </nav>
      {@render children?.()}
    </div>
  </Sidebar.Provider>
{:else}
  <div class="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
    {@render children?.()}
  </div>
{/if}
