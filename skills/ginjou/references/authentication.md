# Authentication Reference

Use this reference when the task includes login, logout, sign-in or sign-out flows, session checks, identity loading, protected sessions, or auth error handling in a Ginjou app.

## Provider Rule

Authentication is an app-level integration. Register it once at the root with `defineAuthContext` and keep auth logic inside the provider instead of scattering it across pages.

## Main Composables

- `useLogin`
- `useLogout`
- `useAuthenticated`
- `useGetIdentity`
- `useCheckError`

## Provider Contract

Implement these methods in your auth adapter passed to `defineAuthContext`:

```typescript
interface Auth {
	login: (params?: any) => Promise<LoginResult | void>
	logout: (params?: any) => Promise<LogoutResult | void>
	check: (params?: any) => Promise<CheckAuthResult>
	checkError: (error: any) => Promise<CheckAuthErrorResult>
	getIdentity?: (params?: any) => Promise<any>
}

interface LoginResult {
	redirectTo?: false | string | RouterGoParams
	ignoreInvalidate?: boolean
}
interface LogoutResult {
	redirectTo?: false | string | RouterGoParams
	ignoreInvalidate?: boolean
}
interface CheckAuthResult { authenticated: boolean }
interface CheckAuthErrorResult<E = any> {
	logout?: boolean
	redirectTo?: false | string | RouterGoParams
	error?: E
}
```

## Composable Usage

```typescript
const { mutateAsync: login, isPending } = useLogin()
const { mutateAsync: logout } = useLogout()
const { data, isLoading } = useAuthenticated() // data.value?.authenticated: boolean (undefined before query resolves)
const { data: identity } = useGetIdentity()
const { mutateAsync: checkError } = useCheckError()
```

## Guidance

- The login payload depends on the backend provider.
- Supabase and Directus already expose opinionated auth flows.
- `@ginjou/with-rest-api` does not provide a matching auth provider, so REST projects usually need a custom auth implementation.
- Keep `401` and `403` distinct. `401` means the session is invalid and the user must re-authenticate; `403` means authenticated but unauthorized — logging the user out on a `403` destroys a valid session and confuses users.
- Treat `useCheckError` as the place where auth-related API failures are normalized.

## Common Mistakes

- Expecting `@ginjou/with-rest-api` to solve auth automatically.
- Mixing login UI concerns with provider implementation details.
- Treating `403` responses as forced logout cases.
- Registering auth conditionally instead of at the app root.

## Authority

- https://ginjou.pages.dev/guides/authentication
- https://ginjou.pages.dev/backend/rest-api
- https://ginjou.pages.dev/backend/supabase
- https://ginjou.pages.dev/backend/directus
