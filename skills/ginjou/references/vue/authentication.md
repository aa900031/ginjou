# Vue Authentication

Use this reference for Vue auth wiring and auth composables. See [Authentication](https://ginjou.pages.dev/raw/guides/authentication.md) for guide-level flows. See [core/authentication.md](../core/authentication.md) for auth contract, redirect results, and session/error boundaries.

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

const { data: authenticated, isLoading } = useAuthenticated()
const { mutateAsync: login, isPending: isLoginLoading } = useLogin()
const { mutateAsync: logout, isPending: isLogoutLoading } = useLogout()
</script>
```

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

Most built-in data query and mutation composables already call `checkError` for you. Use `useCheckError()` manually for custom requests or other flows outside those helpers.

## Rules

- Register `defineAuthContext` unconditionally at the app root.
- Guard against the initial `authenticated` pending state before branching the UI.
- Use `useCheckError()` manually only for custom flows that are outside the built-in data helpers.
- Distinguish `401` and `403` handling in the provider instead of treating both as forced logout.
- Keep provider-specific login payloads aligned with the active backend reference.
