# Setup Reference

Use this reference when the task starts with installation, root wiring, provider registration, or choosing the correct Ginjou package.

## Minimal Setup Examples

**Vue (`App.vue`):**
```vue
<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext, defineRouterContext } from '@ginjou/vue'
import { createRouter } from '@ginjou/with-vue-router'
import { QueryClient } from '@tanstack/vue-query'

defineQueryClientContext(new QueryClient())
defineFetchersContext({ default: myFetcher() }) // e.g. restFetcher(), supabaseFetcher()
defineRouterContext(createRouter()) // omit if no route-aware behavior needed
</script>

<template>
	<RouterView />
</template>
```

**Nuxt (`app.vue` or `app/app.vue`):**
```vue
<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext } from '@ginjou/vue'
import { QueryClient } from '@tanstack/vue-query'

defineQueryClientContext(new QueryClient())
defineFetchersContext({ default: myFetcher() }) // router auto-registered by @ginjou/nuxt module
</script>

<template>
	<NuxtLayout><NuxtPage /></NuxtLayout>
</template>
```

## Framework Split

### Vue

- Install `@ginjou/vue` and `@tanstack/vue-query`.
- Register providers in `App.vue` inside `script setup`.
- Add `defineRouterContext(createRouter())` when using router-aware controllers, route syncing, or resource resolution from URL state.
- Prefer `@ginjou/with-vue-router` for router integration and `@ginjou/with-vue-i18n` for localization.

### Nuxt

- Install `@ginjou/nuxt` and `@tanstack/vue-query`.
- Add `@ginjou/nuxt` to `modules` in `nuxt.config.ts`.
- Register providers in `app.vue` or `app/app.vue`.
- Do not call `defineRouterContext`; the Nuxt module owns router integration.
- Prefer async query/controller composables such as `useAsyncGetList`, `useAsyncList`, `useAsyncShow`, and `useAsyncEdit` when the view should hydrate from SSR.

## Root Wiring Checklist

1. Create a single TanStack Query client at the app root.
2. Register fetchers with `defineFetchersContext`.
3. Register resources with `defineResourceContext` only if route-aware behavior, route-derived IDs, navigation helpers, or per-resource fetcher binding are needed.
4. Register optional providers only when the app uses them: auth, authz, i18n, notification, realtime.
5. Keep provider registration unconditional at the root. Do not gate it by route, auth state, or client-only checks. Conditional registration creates context gaps that break SSR hydration and cause runtime errors when child components access context before it is provided.

## Fetcher Choice

- Use `@ginjou/with-rest-api` when the backend is a generic REST API.
- Use `@ginjou/with-supabase` when the app should lean on Supabase data access and auth.
- Use `@ginjou/with-directus` when the app should lean on Directus data access and auth.
- If the app uses multiple backends, configure multiple fetchers and bind them per resource through `meta.fetcherName`.

## Setup Rules

- Root setup is application wiring, not page logic.
- Keep query client creation stable; do not recreate it inside feature components.
- In Nuxt, prefer root-component setup over plugins for Ginjou provider registration.
- In Vue, do not skip router integration if the task depends on route-derived IDs, route sync, or automatic navigation helpers.
- Do not assume every Ginjou app needs resources. Add them only when the app actually depends on route-aware resource behavior.

## Common Mistakes

- Installing `@ginjou/vue` in Nuxt instead of `@ginjou/nuxt`.
- Registering providers in feature components instead of the root component.
- Forgetting `defineRouterContext` in Vue when using route-aware controllers.
- Adding `defineRouterContext` in Nuxt even though the module already provides router integration.
- Using sync query composables in Nuxt pages that should be SSR hydrated.

## Authority

- https://ginjou.pages.dev/integrations/vue
- https://ginjou.pages.dev/integrations/nuxt
- https://ginjou.pages.dev/backend/rest-api
- https://ginjou.pages.dev/backend/supabase
- https://ginjou.pages.dev/backend/directus
