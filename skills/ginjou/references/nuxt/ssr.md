# Nuxt SSR

> ⚠️ **Warning:** There is **no** `useAsyncCreate` or `useAsyncCustom`. Create and custom write flows are client-only — use `useCreate` or `useCustomMutation` on the client side.

Use this reference for the Nuxt SSR-only surface. See [Nuxt](https://ginjou.pages.dev/raw/integrations/nuxt.md) for the integration walkthrough.
## SSR Composables

These composables are auto-imported by the `@ginjou/nuxt` module:

| Composable | Vue counterpart | Purpose |
| --- | --- | --- |
| `useAsyncGetOne` | `useGetOne` | SSR-safe single record fetch |
| `useAsyncGetMany` | `useGetMany` | SSR-safe batch record fetch |
| `useAsyncGetManyByOne` | `useGetManyByOne` | SSR-safe per-id multi-record fetch |
| `useAsyncGetList` | `useGetList` | SSR-safe paginated list query |
| `useAsyncGetInfiniteList` | `useGetInfiniteList` | SSR-safe infinite query |
| `useAsyncShow` | `useShow` | SSR-safe show controller |
| `useAsyncList` | `useList` | SSR-safe list controller |
| `useAsyncEdit` | `useEdit` | SSR-safe edit controller |
| `useAsyncSelect` | `useSelect` | SSR-safe select/option controller |
| `useAsyncInfiniteList` | `useInfiniteList` | SSR-safe infinite-list controller |
| `useAsyncAuthenticated` | `useAuthenticated` | SSR-safe auth state check |
| `useAsyncGetIdentity` | `useGetIdentity` | SSR-safe identity fetch |
| `useAsyncPermissions` | `usePermissions` | SSR-safe permission snapshot |
| `useAsyncCanAccess` | `useCanAccess` | SSR-safe access check |

> ⚠️ **Warning:** In SSR, always use `useAsyncShow` instead of `useShow`. `useShow` is a client-only controller that does not resolve during server rendering.

## Server vs Client Boundary

- Use `useAsync*` composables in SSR-capable setup flows.
- Keep write-side and auth mutations on the regular client-triggered composables.

## Rules

- Use `useAsync*` composables for data or auth state that must be resolved during SSR.
- Keep write-side mutations on the regular client-triggered composables.
- When a page needs SSR-loaded data plus client-side writes, pair the matching `useAsync*` read composable with the regular write composable.
