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
      <nav class="sticky top-0 z-20 h-14 w-full border-b border-border/80 bg-background/85 px-4 backdrop-blur-sm">
        <div class="relative flex h-full items-center justify-between">
          <div class="flex items-center gap-3">
            <Sidebar.Trigger />
          </div>
          <a
            href="/"
            class="absolute left-1/2 -translate-x-1/2 rounded-md px-2 py-1 text-sm font-semibold tracking-[0.01em] text-foreground/90 transition-colors hover:bg-accent/50 hover:text-foreground"
            >Norn</a
          >
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{data.servers?.length ?? 0} servers</span>
            <span>{data.user?.username}</span>
            <a href="/api/auth/logout" class="text-foreground underline-offset-4 hover:underline">Logout</a>
          </div>
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
