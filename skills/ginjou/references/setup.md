# Setup Reference

Use this reference when installing Ginjou, registering providers, wiring fetchers, setting up SSR in a Vue or Nuxt project, or choosing between the supported backend packages.

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

## Nuxt SSR Multi-Backend Sequence (Worked)

For S05/S09/S18-style prompts, apply this order explicitly:

1. Register `defineQueryClientContext` at app root.
2. Register all named fetchers in `defineFetchersContext` at app root.
3. Register resource routes and per-resource `meta.fetcherName` in `defineResourceContext`.
4. Use `useAsync*` read composables on SSR-first pages.
5. Keep create/update/delete actions on regular mutation composables.

Example wiring order:

```vue
<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext, defineResourceContext } from '@ginjou/vue'
import { createFetcher as createRestFetcher } from '@ginjou/with-rest-api'
import { createFetcher as createSupabaseFetcher } from '@ginjou/with-supabase'
import { QueryClient } from '@tanstack/vue-query'

defineQueryClientContext(new QueryClient())

defineFetchersContext({
	'rest-api': createRestFetcher({ url: 'https://api.example.com' }),
	'supabase': createSupabaseFetcher({ client: supabaseClient }),
})

defineResourceContext({
	resources: [
		{ name: 'users', list: '/users', meta: { fetcherName: 'supabase' } },
		{ name: 'products', list: '/products', meta: { fetcherName: 'rest-api' } },
	],
})
</script>
```

Then on SSR-first list/show pages, use `useAsyncGetList` / `useAsyncShow` rather than sync read composables.

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

## Choosing a Backend Package

Use this section when the question is "Which backend should I use?" or when the answer depends on backend-specific query or auth behavior.

| Backend | Choose when | Auth | Query or `meta` strengths | Next reference |
| --- | --- | --- | --- | --- |
| REST API | The backend is a generic or custom HTTP API, or the app needs custom headers, methods, or an `ofetch` client | Custom `defineAuth` implementation | `meta.method`, `meta.headers`, custom client wiring | [backend-rest-api.md](./backend-rest-api.md) |
| Supabase | The backend is Supabase, or the task mentions Postgrest `select`, `count`, `idColumnName`, or Supabase auth types | Built-in `createAuth` | Postgrest `select`, `count`, `idColumnName` | [backend-supabase.md](./backend-supabase.md) |
| Directus | The backend is Directus, or the task mentions Directus fields, filters, aggregates, `groupBy`, or Directus auth | Built-in `createAuth` | `meta.query`, `aggregate`, `groupBy` | [backend-directus.md](./backend-directus.md) |

If the task compares backends, start here, then continue into the matching backend reference before recommending one. Do not compare backend capabilities from memory.

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

Use the `useAsync*` variants when the page should render server-fetched data during SSR or initial hydration. Keep using the regular mutation composables for client-triggered actions such as create, update, delete, or login.

## Rules

- Register providers unconditionally at the app root. Never gate them behind route checks or auth state.
- Create the `QueryClient` once at the app root — do not recreate it inside feature components.
- In Nuxt, prefer `app.vue` over Nuxt plugins for provider registration.
- In Vue, add `defineRouterContext` when the app uses `useShow`, `useEdit`, `useList` with `syncRoute`, or navigation helpers.
- Backend comparison questions start here, then continue to the matching backend reference for auth methods and backend-specific `meta` rules.
- Multi-backend apps usually combine this file with [resources.md](./resources.md): `defineFetchersContext` registers the fetchers here, and `meta.fetcherName` selects one per resource there.
- For Nuxt SSR plus multi-backend apps, combine the `useAsync*` read composables from this file with resource-level `meta.fetcherName` binding from [resources.md](./resources.md), then read the matching backend reference for each fetcher's `meta` rules.
- Do not stop at this file for backend-specific auth or query syntax. Continue into the matching backend reference.

## Common Mistakes

- Installing `@ginjou/vue` in a Nuxt project (use `@ginjou/nuxt` instead).
- Calling `defineRouterContext` in a Nuxt app.
- Registering providers inside feature components instead of the app root.
- Using sync composables on SSR-first Nuxt pages (use `useAsync*` counterparts).

## Further Reading

- https://ginjou.pages.dev/integrations/vue
- https://ginjou.pages.dev/integrations/nuxt
