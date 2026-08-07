# Nuxt Router

Use this reference for the Nuxt router boundary only. See [Router](https://ginjou.pages.dev/raw/guides/router.md) for helper behavior and [Nuxt](https://ginjou.pages.dev/raw/integrations/nuxt.md) for module setup.

## Module-Owned Router Integration

`@ginjou/nuxt` owns router integration for a Nuxt app. Do not register `defineRouterContext` manually.

## Auto-Import Boundary

`useNavigateTo` is the only router helper auto-imported by the Nuxt module. Import `useGo`, `useBack`, `useLocation`, `useResolvePath`, and `useRouteBlocker` from `@ginjou/vue`.

```ts
import { useBack, useGo, useLocation, useResolvePath, useRouteBlocker } from '@ginjou/vue'
```

## Route Blocker

`@ginjou/nuxt` registers the router context through its own plugin, so the vue-router blocker works with no user wiring. See [vue.md](./vue.md) for `useRouteBlocker` usage and the `setup`-only requirement, and [behavior.md](./behavior.md) for decision semantics.

## Rules

- Treat Nuxt router support as module-owned integration.
- Do not call `defineRouterContext` manually in Nuxt.
- Only assume `useNavigateTo` is auto-imported from the documented router helper set.
- Import `useGo`, `useBack`, `useLocation`, `useResolvePath`, and `useRouteBlocker` explicitly from `@ginjou/vue`.
- Do not wire the route blocker manually; the module's plugin already registers the router context.
