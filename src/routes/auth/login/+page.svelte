<script lang="ts">
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Label } from "$lib/components/shadcn-svelte/label"
  import * as Card from "$lib/components/shadcn-svelte/card"

  let { data } = $props()

  const redirectTo = $derived(data.redirectTo ?? "/")
</script>

<svelte:head>
  <title>Sign In - Norn</title>
</svelte:head>

<div class="w-full max-w-md">
  <Card.Root class="border-border/60 bg-card/95 shadow-2xl shadow-slate-900/10 backdrop-blur">
    <Card.Header>
      <Card.Title class="text-2xl">Sign in</Card.Title>
    </Card.Header>
    <Card.Content>
      <form method="POST" action="/api/auth/login" class="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div class="space-y-2">
          <Label for="username">Username</Label>
          <Input id="username" name="username" autocomplete="username" required />
        </div>
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input id="password" name="password" type="password" autocomplete="current-password" required />
        </div>
        {#if data.errorMessage}
          <p class="text-sm text-destructive">{data.errorMessage}</p>
        {/if}
        <Button type="submit" class="w-full">Sign in</Button>
      </form>
    </Card.Content>
  </Card.Root>
</div>
