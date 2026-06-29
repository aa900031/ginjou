# Svelte Authentication

Auth wiring and composables for Svelte 5. **`defineAuthContext`, `useLogin`,
`useLogout`, `useAuthenticated`, `useGetIdentity`, `useCheckError` and the auth
contract match Vue** — read [vue/authentication.md](../vue/authentication.md) and
[core/authentication.md](../core/authentication.md). This file pins only the
Svelte syntax.

## Wire the provider at the root

`defineAuth` comes from `@ginjou/core` (framework-agnostic); register it with
`defineAuthContext` from `@ginjou/svelte` in `App.svelte`.

```svelte
<script lang="ts">
import { defineAuth } from '@ginjou/core'
import { defineAuthContext } from '@ginjou/svelte'

defineAuthContext(defineAuth({
  login: async () => ({}),
  logout: async () => ({}),
  check: async () => ({ authenticated: false }),
  checkError: async (e) => ((e as any).status === 401 ? { logout: true } : {}),
  getIdentity: async () => null,
}))
</script>
```

## Login / logout / session

Destructure the mutate methods; read reactive state (`isPending`, session
`data`) off the kept object.

```svelte
<script lang="ts">
import { useAuthenticated, useLogin, useLogout } from '@ginjou/svelte'

const session = useAuthenticated()          // read session.data / session.isLoading
const { mutateAsync: login } = useLogin<{ email: string, password: string }>()
const { mutateAsync: logout } = useLogout()

const form = $state({ email: '', password: '' })
</script>

{#if session.data}
  <button onclick={() => logout({})}>Log out</button>
{:else}
  <form onsubmit={(e) => { e.preventDefault(); login({ ...form }) }}>
    <input bind:value={form.email} />
    <input type="password" bind:value={form.password} />
    <button type="submit">Log in</button>
  </form>
{/if}
```

## Rules

- Check session via `useAuthenticated` (the provider's `check()`), never by reading `localStorage`/cookies directly.
- Guard the initial pending state of `session.data` before branching UI.
- Distinguish 401 vs 403 in the provider; only 401 forces logout. (Same as Vue/core.)
