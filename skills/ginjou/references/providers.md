# Providers Reference

Use this reference when the task includes authentication, authorization, notifications, or realtime.

## Provider Rule

Providers are app-level integrations. Register them once at the root and let composables consume them indirectly.

## Authentication

Use `defineAuthContext` with an auth provider that implements the app's backend-specific login and session contract.

Key composables:

- `useLogin`
- `useLogout`
- `useAuthenticated`
- `useGetIdentity`
- `useCheckError`

Guidance:

- The exact login payload depends on the backend provider.
- Supabase and Directus already expose opinionated auth flows.
- `@ginjou/with-rest-api` does not provide a matching auth provider, so REST projects usually need a custom auth implementation.
- Keep `401` and `403` distinct. `401` often means session invalidation; `403` usually means access denied without logout.

## Authorization

Use `defineAuthzContext` for access checks and permissions.

Key composables:

- `useCanAccess`
- `usePermissions`

Guidance:

- Return `{ can: boolean }` from `authz.access` as the core contract.
- Keep business rules inside the provider instead of spreading authorization decisions through components.
- Use permissions for coarse-grained UI state and `useCanAccess` for action-level checks.

## Notifications

Use `defineNotificationContext` for toast, snackbar, or alert integration.

Key composable:

- `useNotify`

Guidance:

- Implement both `open` and `close`.
- Support progress notifications if the UX includes undo windows or long-running actions.
- Remember that `undoable` mutation modes depend on the notification provider.

## Realtime

Use `defineRealtimeContext` to subscribe to backend events and keep resource queries synchronized.

Guidance:

- Default to auto mode when invalidation and refetch are enough.
- Use manual mode when different event types should trigger custom side effects.
- Keep the provider contract focused on subscribe, unsubscribe, and publish behavior.

If the user only asks for live data updates and does not specify a custom event workflow, choose auto mode first.

## Common Mistakes

- Treating auth and authz as the same provider.
- Expecting `@ginjou/with-rest-api` to solve auth automatically.
- Using `undoable` mutation flows without notifications.
- Choosing manual realtime mode when auto invalidation would be simpler.
- Putting provider logic inside page components instead of root wiring.

## Authority

- `docs/content/1.guides/4.authentication.md`
- `docs/content/1.guides/5.authorization.md`
- `docs/content/1.guides/6.notifications.md`
- `docs/content/1.guides/7.realtime.md`
- `docs/content/3.backend/*.md`
