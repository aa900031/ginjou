# Svelte Authentication

Auth wiring and composables for Svelte 5. See [Authentication](https://ginjou.pages.dev/raw/guides/authentication.md) for guide-level flows. This file pins the Svelte syntax.

## Contract

```ts
interface Auth {
	login: LoginFn<any>
	logout: LogoutFn<any>
	check: CheckAuthFn<any>
	checkError: CheckAuthErrorFn<unknown>
	getIdentity?: GetIdentityFn<unknown, any>
}
```

`login` and `logout` can return redirect instructions. `check` answers whether the current session is authenticated. `checkError` inspects failed requests for session-expiry or redirect behavior. `getIdentity` is optional and returns the current user or `null`.

`login` and `logout` may return:

- `redirectTo` as `false`, a string path, or router params
- `ignoreInvalidate` when the provider wants to skip the normal cache invalidation step

`checkError` may return:

- `logout` when the session should be cleared
- `redirectTo` when the app should navigate away
- `error` when the provider wants to normalize or replace the original error

Keep expired-session handling in `checkError`; a common boundary is to log out on `401` but not on `403`.

`getIdentity` is optional. Add it only when the UI needs current-user details; otherwise `login`, `logout`, `check`, and `checkError` are enough. Keep provider-specific login payloads and built-in adapters in the matching backend reference.

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
// `check()` returns `{ authenticated: boolean }`, so the flag is
// `session.data?.authenticated` — NOT `session.data` (the wrapper is always truthy).
</script>

{#if session.data?.authenticated}
  <button onclick={() => logout({})}>Log out</button>
{:else}
  <form onsubmit={(e) => { e.preventDefault(); login({ ...form }) }}>
    <input bind:value={form.email} />
    <input type="password" bind:value={form.password} />
    <button type="submit">Log in</button>
  </form>
{/if}
```

`useGetIdentity`, `useCheckError`, `useLogin`, `useLogout`, `useAuthenticated`
match Vue's names and options.

## Rules

- Keep session lifecycle logic inside the auth provider.
- Check session via `useAuthenticated` (the provider's `check()`), never by reading `localStorage`/cookies directly.
- Branch on `session.data?.authenticated` (the boolean flag), not `session.data` (the wrapper object, always truthy once loaded). Guard the initial pending state first.
- Use `checkError` for expired-session and redirect decisions instead of duplicating error handling in features.
- Distinguish session expiry from permission denial; `401` and `403` should not share the same default action — only `401` forces logout.
- Treat `getIdentity` as optional capability, not as a required part of authentication.
- Built-in data query/mutation composables already invoke `checkError` automatically — don't wrap every feature-page fetch with `useCheckError()`; reserve it for custom requests.
- Keep provider-specific login payload shapes in the matching backend reference.
