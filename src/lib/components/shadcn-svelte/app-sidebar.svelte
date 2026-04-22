<script lang="ts">
  import * as Sidebar from "$lib/components/shadcn-svelte/sidebar"
  import { page } from "$app/state"
  import { HouseIcon } from "lucide-svelte"
  import type { McServerState } from "$lib/types"
  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: HouseIcon
    }
  ]
  const { servers }: { servers: McServerState[] } = $props()
</script>

<Sidebar.Root>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Action</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each items as item (item.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton class="py-5">
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

    <Sidebar.Group>
      <Sidebar.GroupLabel>Servers</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each servers ?? [] as server (server.info.id)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton class="py-5" isActive={page.url.pathname === `/servers/${server.info.id}`}>
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
