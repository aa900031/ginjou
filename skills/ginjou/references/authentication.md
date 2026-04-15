# Authentication Reference

Use this reference for login, logout, session checks, identity loading, and auth error handling.

## Concept

Ginjou auth is powered by a provider registered with `defineAuthContext`. The provider implements `login`, `logout`, `check`, `checkError`, and optionally `getIdentity`. Composables in components then call the provider through a stable interface.

## Provider Setup

```typescript
import { defineAuth } from '@ginjou/core'
import { defineAuthContext } from '@ginjou/vue'

defineAuthContext(defineAuth({
	login: async (params) => {
		// Authenticate. Return { redirectTo? } or void.
		return {}
	},
	logout: async (params) => {
		// Clear session. Return { redirectTo? } or void.
		return {}
	},
	check: async () => {
		// Return { authenticated: boolean }
		return { authenticated: false }
	},
	checkError: async (error) => {
		// Inspect errors from failed data fetches.
		// Return { logout?: boolean, redirectTo?, error? }
		if ((error as any).status === 401)
			return { logout: true }
		return {}
	},
	getIdentity: async () => {
		// Return user data or null
		return null
	},
}))
```

Supabase and Directus each provide a ready-made auth adapter. See their dedicated backend references.

## Composable Usage

```vue
<!-- From stories/vue/src/Auth.vue -->
<script setup lang="ts">
import { useAuthenticated, useLogin, useLogout } from '@ginjou/vue'

const { data: authenticated, isLoading } = useAuthenticated()
const { mutateAsync: login, isPending: isLoginLoading } = useLogin()
const { mutateAsync: logout, isPending: isLogoutLoading } = useLogout()
</script>

<template>
	<template v-if="isLoading || authenticated == null">
		Checking auth…
	</template>
	<template v-else-if="authenticated.authenticated === true">
		Logged in
		<button :disabled="isLogoutLoading" @click="logout()">
			Logout
		</button>
	</template>
	<template v-else>
		<button :disabled="isLoginLoading" @click="login({ email: 'user@example.com', password: '…' })">
			Login
		</button>
	</template>
</template>
```

```vue
<!-- From stories/vue/src/AuthGetIdentity.vue -->
<script setup lang="ts">
import { useGetIdentity } from '@ginjou/vue'

const { data: identity, isLoading } = useGetIdentity<{ username: string }>()
</script>

<template>
	<template v-if="isLoading || identity == null">
		Loading…
	</template>
	<template v-else>
		Hi! {{ identity.username }}
	</template>
</template>
```

```typescript
// Handle an API error that may indicate an expired session
import { useCheckError } from '@ginjou/vue'

const { mutateAsync: checkError } = useCheckError()
try {
	await someDataFetch()
}
catch (err) {
	await checkError(err)
}
```

## Composable Reference

| Composable | What it does |
| --- | --- |
| `useAuthenticated` | Query — returns `{ authenticated: boolean }` |
| `useLogin` | Mutation — triggers `auth.login` |
| `useLogout` | Mutation — triggers `auth.logout` |
| `useGetIdentity` | Query — returns user identity data |
| `useCheckError` | Mutation — passes an error to `auth.checkError` |

## Nuxt SSR Variants

| Vue | Nuxt SSR |
| --- | --- |
| `useAuthenticated` | `useAsyncAuthenticated` |
| `useGetIdentity` | `useAsyncGetIdentity` |

`useLogin`, `useLogout`, and `useCheckError` have no async variants.

## Rules

- `authenticated.value` is `undefined` while the initial check is pending — always guard against it.
- Distinguish `401` (session expired → logout) from `403` (forbidden → do not log out).
- Register `defineAuthContext` unconditionally at the app root.
- The login payload shape depends on your provider. Supabase and Directus have typed `LoginParams` unions.

## Further Reading

- https://ginjou.pages.dev/guides/authentication
- https://ginjou.pages.dev/backend/supabase
- https://ginjou.pages.dev/backend/directus
