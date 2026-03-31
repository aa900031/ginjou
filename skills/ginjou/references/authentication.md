# Authentication Reference

Use this reference when the task includes login, logout, sign-in or sign-out flows, checking whether the current user is authenticated, session checks, identity loading, explicit auth error handling, or protected sessions in a Ginjou app.

## Provider Rule

Authentication is an app-level integration. Register it once at the root with `defineAuthContext` and keep auth logic inside the provider instead of scattering it across pages.

## Main Composables

- `useLogin` — triggers login mutation
- `useLogout` — triggers logout mutation
- `useAuthenticated` — query for current auth status
- `useGetIdentity` — query for current user identity data
- `useCheckError` — mutation to explicitly handle an API error (triggers logout/redirect on auth failure)

## Provider Contract

```typescript
import { defineAuth } from '@ginjou/core'
import { defineAuthContext } from '@ginjou/vue'

defineAuthContext(defineAuth({
  login: async (params?) => {
    // authenticate, return { redirectTo? } or void
    return {}
  },
  logout: async (params?) => {
    // clear session, return { redirectTo? } or void
    return {}
  },
  check: async (params?) => {
    // return { authenticated: boolean }
    return { authenticated: false }
  },
  checkError: async (error) => {
    // inspect the error, return { logout?: boolean, redirectTo?, error? }
    if ((error as any).isAuthError) return { logout: true }
    return {}
  },
  getIdentity: async (params?) => {
    // return user data or null
    return null
  },
}))
```

### Return Type Reference

| Method | Return type | Key fields |
| --- | --- | --- |
| `login` | `LoginResult \| void` | `redirectTo?: false \| string`, `ignoreInvalidate?: boolean` |
| `logout` | `LogoutResult \| void` | `redirectTo?: false \| string`, `ignoreInvalidate?: boolean` |
| `check` | `CheckAuthResult` | `authenticated: boolean` |
| `checkError` | `CheckAuthErrorResult` | `logout?: boolean`, `redirectTo?: false \| string`, `error?` |
| `getIdentity` | `any` | user-defined shape |

## Composable Usage

```typescript
import { useAuthenticated, useCheckError, useGetIdentity, useLogin, useLogout } from '@ginjou/vue'

// Check auth status — data.value is undefined until the query resolves
const { data: authenticated, isLoading } = useAuthenticated()
// authenticated.value?.authenticated === true | false

// User identity
const { data: identity } = useGetIdentity()

// Login / logout — these are mutations
const { mutateAsync: login, isPending: isLoginPending } = useLogin()
const { mutateAsync: logout, isPending: isLogoutPending } = useLogout()

await login({ username: 'user', password: 'pass' }) // params depend on your provider
await logout()

// Explicitly handle an API error (e.g., from a failed data fetch)
const { mutateAsync: checkError } = useCheckError()
await checkError(thrownError) // provider decides whether to logout/redirect
```

## Guidance

- The login payload shape depends entirely on the backend provider.
- `@ginjou/with-supabase` and `@ginjou/with-directus` each expose their own predefined auth adapters.
- `@ginjou/with-rest-api` does **not** provide a matching auth adapter — REST projects need a custom auth implementation.
- Keep `401` and `403` distinct: `401` means the session is invalid and the user must re-authenticate; `403` means authenticated but unauthorized — logging out on a `403` destroys a valid session.
- `useCheckError` is the canonical place to normalize auth-related API failures. Call it when a data fetch or mutation throws an error that may indicate an expired session.

## Nuxt SSR Variants

For Nuxt views that need server-hydrated auth state, use:

| Vue | Nuxt SSR |
| --- | --- |
| `useAuthenticated` | `useAsyncAuthenticated` |
| `useGetIdentity` | `useAsyncGetIdentity` |

`useLogin`, `useLogout`, and `useCheckError` are mutation-first and do not have async variants.

## Common Mistakes

- Expecting `@ginjou/with-rest-api` to solve auth automatically.
- Mixing login UI concerns with provider implementation details.
- Treating `403` as a forced logout case — it is not.
- Registering auth conditionally instead of at the app root.
- Not handling the case where `authenticated.value` is `undefined` while the initial check query is still loading.

## Authority

- https://ginjou.pages.dev/guides/authentication
- https://ginjou.pages.dev/backend/rest-api
- https://ginjou.pages.dev/backend/supabase
- https://ginjou.pages.dev/backend/directus
