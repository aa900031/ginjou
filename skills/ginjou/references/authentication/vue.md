# Vue Authentication

Use this reference for Vue auth wiring and auth composables. See [Authentication](https://ginjou.pages.dev/raw/guides/authentication.md) for guide-level flows.

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

## `defineAuthContext`

Register the auth provider once at the app root.

```ts
import { defineAuth } from '@ginjou/core'
import { defineAuthContext } from '@ginjou/vue'

defineAuthContext(defineAuth({
	login: async () => ({}),
	logout: async () => ({}),
	check: async () => ({ authenticated: false }),
	checkError: async error => ((error as any).status === 401 ? { logout: true } : {}),
	getIdentity: async () => null,
}))
```

## `useAuthenticated`, `useLogin`, And `useLogout`

`useAuthenticated()` reads session state. `useLogin()` and `useLogout()` run the provider mutations.

> ⚠️ **Warning:** Do **not** check login state by directly reading `localStorage` or cookies. Always go through the auth provider's `check()` method via `useAuthenticated`.

```vue
<script setup lang="ts">
import { useAuthenticated, useLogin, useLogout } from '@ginjou/vue'

const { data, isLoading } = useAuthenticated()
const { mutateAsync: login, isPending: isLoginLoading } = useLogin()
const { mutateAsync: logout, isPending: isLogoutLoading } = useLogout()
</script>

<template>
	<span v-if="isLoading">…</span>
	<button v-else-if="data?.authenticated" @click="logout()">
		Logout
	</button>
	<button v-else @click="login(/* { email, password } */)">
		Login
	</button>
</template>
```

> ⚠️ **Warning:** `check()` returns `{ authenticated: boolean }`, so the login flag is `data?.authenticated` — **not** `data` itself. Reading the wrapper object as a boolean is always truthy. Do not rename `data` to `authenticated` and branch on it directly.

Minimal login call:

```ts
import { useLogin } from '@ginjou/vue'

const { mutateAsync: login } = useLogin<{ email: string, password: string }>()

await login({ email: 'user@example.com', password: '…' })
```

## `useGetIdentity`

`useGetIdentity()` loads current-user identity data when the provider implements `getIdentity`.

```vue
<script setup lang="ts">
import { useGetIdentity } from '@ginjou/vue'

const { data: identity, isLoading } = useGetIdentity<{ username: string }>()
</script>
```

## `useCheckError`

`useCheckError()` passes an error through the auth provider's `checkError` logic.

```ts
import { useCheckError } from '@ginjou/vue'

const { mutateAsync: checkError } = useCheckError()

try {
	await someDataFetch()
}
catch (error) {
	await checkError(error)
}
```

> ⚠️ **Note:** Built-in data query and mutation composables already invoke `checkError` automatically. You do **not** need to wrap every feature-page fetch with `useCheckError()` — reserve it for custom requests or flows outside those helpers.

## Rules

- Keep session lifecycle logic inside the auth provider.
- Register `defineAuthContext` unconditionally at the app root.
- Guard against the initial `authenticated` pending state before branching the UI.
- Use `checkError` for expired-session and redirect decisions instead of duplicating error handling in features; use `useCheckError()` manually only for custom flows outside the built-in data helpers.
- Distinguish session expiry from permission denial; `401` and `403` should not share the same default action (only `401` forces logout).
- Treat `getIdentity` as optional capability, not as a required part of authentication.
- Keep provider-specific login payload shapes in the matching backend reference.
