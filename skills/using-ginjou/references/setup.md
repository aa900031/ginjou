# Setup Reference

Use this reference when installing Ginjou, registering providers, wiring fetchers, or setting up SSR in a Vue or Nuxt project.

## Concept

Ginjou requires a small set of providers registered at the app root. Only two are mandatory: a TanStack Query client and at least one data fetcher. All other providers (auth, authz, router, i18n, notification, realtime, resources) are optional — add them only when the app actually uses them.

## Vue Setup

Install packages:

```bash
pnpm add @ginjou/vue @tanstack/vue-query
```

Register providers in `App.vue`:

```vue
<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext, defineRouterContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'
import { createRouter } from '@ginjou/with-vue-router'
import { QueryClient } from '@tanstack/vue-query'

defineQueryClientContext(new QueryClient())
defineFetchersContext({ default: createFetcher({ url: 'https://api.example.com' }) })
defineRouterContext(createRouter()) // omit if no route-aware behavior is needed
</script>

<template>
  <RouterView />
</template>
```

## Nuxt Setup

Install the module:

```bash
pnpm add @ginjou/nuxt @tanstack/vue-query
```

Add to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@ginjou/nuxt'],
})
```

Register providers in `app.vue` (or `app/app.vue`):

```vue
<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'
import { QueryClient } from '@tanstack/vue-query'

defineQueryClientContext(new QueryClient())
defineFetchersContext({ default: createFetcher({ url: 'https://api.example.com' }) })
// Do NOT call defineRouterContext — the Nuxt module owns router integration
</script>

<template>
  <NuxtLayout><NuxtPage /></NuxtLayout>
</template>
```

## Provider Reference

| Provider | When to add |
| --- | --- |
| `defineQueryClientContext` | Always (required) |
| `defineFetchersContext` | Always (required) |
| `defineRouterContext` | Vue only — when route-aware controllers, URL sync, or navigation helpers are needed |
| `defineResourceContext` | When route-aware context resolution, navigation, breadcrumbs, or multi-backend routing is needed |
| `defineAuthContext` | When the app has login/logout/session flows |
| `defineAuthzContext` | When the app has permission checks or access control |
| `defineI18nContext` | When the app uses i18n / localization |
| `defineNotificationContext` | When the app shows toast/progress notifications, or uses undoable mutations |
| `defineRealtimeContext` | When the app has live updates |

All providers are imported from `@ginjou/vue`.

## Nuxt SSR Composables

For server-hydrated views in Nuxt, use the `useAsync*` variants instead of the regular composables:

| Regular | Nuxt SSR |
| --- | --- |
| `useList` | `useAsyncList` |
| `useShow` | `useAsyncShow` |
| `useEdit` | `useAsyncEdit` |
| `useSelect` | `useAsyncSelect` |
| `useGetList` | `useAsyncGetList` |
| `useGetOne` | `useAsyncGetOne` |
| `useAuthenticated` | `useAsyncAuthenticated` |
| `useGetIdentity` | `useAsyncGetIdentity` |
| `useCanAccess` | `useAsyncCanAccess` |
| `usePermissions` | `useAsyncPermissions` |

`useCreate` has no async variant — use it directly in Nuxt too.

## Rules

- Register providers unconditionally at the app root. Never gate them behind route checks or auth state.
- Create the `QueryClient` once at the app root — do not recreate it inside feature components.
- In Nuxt, prefer `app.vue` over Nuxt plugins for provider registration.
- In Vue, add `defineRouterContext` when the app uses `useShow`, `useEdit`, `useList` with `syncRoute`, or navigation helpers.

## Common Mistakes

- Installing `@ginjou/vue` in a Nuxt project (use `@ginjou/nuxt` instead).
- Calling `defineRouterContext` in a Nuxt app.
- Registering providers inside feature components instead of the app root.
- Using sync composables on SSR-first Nuxt pages (use `useAsync*` counterparts).

## Further Reading

- https://ginjou.pages.dev/integrations/vue
- https://ginjou.pages.dev/integrations/nuxt
