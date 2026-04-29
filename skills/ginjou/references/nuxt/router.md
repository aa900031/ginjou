# Nuxt Router

Use this reference for the Nuxt router boundary only. See [Router](https://ginjou.pages.dev/raw/guides/router.md) for helper behavior and [Nuxt](https://ginjou.pages.dev/raw/integrations/nuxt.md) for module setup.

## Module-Owned Router Integration

`@ginjou/nuxt` owns router integration for a Nuxt app. Do not register `defineRouterContext` manually.

## Auto-Import Boundary

Only `useNavigateTo` is auto-imported by the Nuxt module. Import `useGo`, `useBack`, `useLocation`, and `useResolvePath` from `@ginjou/vue`.

```ts
import { useBack, useGo, useLocation, useResolvePath } from '@ginjou/vue'
```

## Rules

- Treat Nuxt router support as module-owned integration.
- Do not call `defineRouterContext` manually in Nuxt.
- Only assume `useNavigateTo` is auto-imported from the documented router helper set.
- Import `useGo`, `useBack`, `useLocation`, and `useResolvePath` explicitly from `@ginjou/vue`.
