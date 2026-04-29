<script lang="ts">
  import { Button } from "$lib/components/shadcn-svelte/button"
  import { Input } from "$lib/components/shadcn-svelte/input"
  import { Label } from "$lib/components/shadcn-svelte/label"
  import * as Card from "$lib/components/shadcn-svelte/card"

  let { data } = $props()

  const redirectTo = $derived(data.redirectTo ?? "/")

  let password = $state("")
  let confirmPassword = $state("")
  let clientError = $state("")

  function handleSubmit(event: SubmitEvent) {
    clientError = ""

    if (password !== confirmPassword) {
      event.preventDefault()
      clientError = "Passwords do not match."
    }
  }
</script>

<div class="w-full max-w-md">
  <Card.Root class="border-border/60 bg-card/95 shadow-2xl shadow-slate-900/10 backdrop-blur">
    <Card.Header>
      <Card.Title class="text-2xl">Create admin account</Card.Title>
    </Card.Header>
    <Card.Content>
      <form method="POST" action="/api/auth/setup" class="space-y-4" onsubmit={handleSubmit}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div class="space-y-2">
          <Label for="username">Username</Label>
          <Input id="username" name="username" autocomplete="username" required />
        </div>
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            bind:value={password}
          />
        </div>
        <div class="space-y-2">
          <Label for="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            bind:value={confirmPassword}
          />
        </div>

        {#if clientError || data.errorMessage}
          <p class="text-sm text-destructive">{clientError || data.errorMessage}</p>
        {/if}

        <Button type="submit" class="w-full">Create account</Button>
      </form>
    </Card.Content>
  </Card.Root>
</div>
