<script lang="ts">
  import * as Sidebar from "$lib/components/shadcn-svelte/sidebar"
  import { HouseIcon, SettingsIcon } from "lucide-svelte"
  const items = [
    {
      title: "Dashboard",
      url: "#",
      icon: HouseIcon
    },
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon
    }
  ]
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
  </Sidebar.Content>
</Sidebar.Root>
