<script lang="ts">
  import * as Sidebar from "$lib/components/shadcn-svelte/sidebar"
  import { HouseIcon } from "lucide-svelte"
  import { page } from "$app/state"
  import type { McServerState } from "$lib/types"

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: HouseIcon
    }
  ]

  const { servers }: { servers: McServerState[] } = $props()
  const currentPath = $derived(page.url.pathname)
</script>

<Sidebar.Root>
  <Sidebar.Content class="py-2">
    <Sidebar.Group class="px-2 pt-1 pb-2">
      <Sidebar.GroupLabel class="px-3 text-[11px] font-semibold tracking-wide text-sidebar-foreground/55 uppercase">
        Navigation
      </Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="space-y-1">
          {#each items as item (item.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={currentPath === item.url}
                class="h-10 rounded-lg px-3 text-[15px] font-medium transition-colors data-[active=true]:bg-sidebar-accent/70"
              >
                {#snippet child({ props })}
                  <a href={item.url} {...props}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>

    <Sidebar.Separator class="ml-0 mr-4" />

    <Sidebar.Group class="px-2 pt-2 pb-3">
      <Sidebar.GroupLabel class="px-3 text-[11px] font-semibold tracking-wide text-sidebar-foreground/55 uppercase">
        Servers
      </Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu class="space-y-0.5">
          {#each servers ?? [] as server (server.info.id)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={currentPath.startsWith(`/servers/${server.info.id}`)}
                class="h-9 rounded-lg px-3 text-[14px] text-sidebar-foreground/90 transition-colors data-[active=true]:bg-sidebar-accent/60 data-[active=true]:text-sidebar-foreground"
              >
                {#snippet child({ props })}
                  <a href={`/servers/${server.info.id}`} {...props}>
                    <span>{server.info.name}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
</Sidebar.Root>
