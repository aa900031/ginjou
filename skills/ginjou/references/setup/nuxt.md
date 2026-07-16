# Nuxt Setup

Use this reference for the Nuxt-specific setup boundary. See [Nuxt](https://ginjou.pages.dev/raw/integrations/nuxt.md) for the full integration walkthrough.

## Module Configuration

Add the module to `nuxt.config.ts` and keep `@ginjou/vue` installed alongside `@ginjou/nuxt`.

```ts
export default defineNuxtConfig({
	modules: ['@ginjou/nuxt'],
})
```

> ⚠️ **Warning:** You must install `@tanstack/vue-query` alongside `@ginjou/nuxt` and `@ginjou/vue`. The Nuxt module does not auto-install it.

## App Root Wiring

Register providers in `app.vue` or `app/app.vue`.

```vue
<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'
import { QueryClient } from '@tanstack/vue-query'

defineQueryClientContext(new QueryClient())
defineFetchersContext({
	default: createFetcher({ url: 'https://api.example.com' }),
})
</script>
```

The Nuxt module owns router integration. Do not call `defineRouterContext`
manually in a Nuxt app.

## SSR-First Multi-Backend Order

When SSR, named fetchers, and resource binding all matter together, keep this
order:

1. Register `defineQueryClientContext` at the app boundary.
2. Register every named fetcher in `defineFetchersContext`.
3. Register resource definitions and `meta.fetcherName` bindings in `defineControllerContext`.
4. Use `useAsync*` composables on SSR-first read surfaces.
5. Keep create, update, and delete actions on the regular mutation composables.

## Auto-Import Boundary

`@ginjou/nuxt` auto-imports `useNavigateTo`, but `useGo`, `useBack`, `useLocation`, and `useResolvePath` still come from `@ginjou/vue`.

```ts
import { useBack, useGo, useLocation, useResolvePath } from '@ginjou/vue'
```

See [Router](https://ginjou.pages.dev/raw/guides/router.md) for router helper behavior and [Nuxt](https://ginjou.pages.dev/raw/integrations/nuxt.md) for the full Nuxt integration guide.

## Rules

- Register providers in `app.vue` at the application boundary.
- Keep `@ginjou/vue` installed alongside `@ginjou/nuxt`.
- Do not call `defineRouterContext` manually in Nuxt.
- Only assume documented auto-imports. `useGo`, `useBack`, `useLocation`, and `useResolvePath` still need explicit imports.
- Use `useAsync*` composables for SSR-first read flows, and keep client-triggered mutations on the regular composables.
- Keep multi-backend SSR guidance in this order: query client, fetchers, resources, SSR reads, then client-triggered mutations.
