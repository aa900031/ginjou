# Vue Setup

Use this reference for Vue 3 root wiring. See [Vue](https://ginjou.pages.dev/raw/integrations/vue.md) for the full setup walkthrough. See [core/setup.md](../core/setup.md) for provider-model, optional-capability, and multi-backend rules.

## Installation

```bash
pnpm add @ginjou/vue @tanstack/vue-query
```

## Context Functions

| Context | Function | Required |
| --- | --- | --- |
| Query Client | `defineQueryClientContext` | Yes |
| Fetchers | `defineFetchersContext` | Yes |
| Router | `defineRouterContext` | Conditional (when route-aware features used) |
| Resources | `defineControllerContext` | Conditional (when resources used) |
| Auth | `defineAuthContext` | Optional |
| Authorization | `defineAuthzContext` | Optional |
| Notifications | `defineNotificationContext` | Optional |
| Realtime | `defineRealtimeContext` | Optional |
| I18n | `defineI18nContext` | Optional |

## App Root Wiring

Register contexts once in `App.vue`.

```vue
<script setup lang="ts">
import { defineFetchersContext, defineQueryClientContext, defineRouterContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'
import { createRouter } from '@ginjou/with-vue-router'
import { QueryClient } from '@tanstack/vue-query'

defineQueryClientContext(new QueryClient())
defineFetchersContext({
	default: createFetcher({ url: 'https://api.example.com' }),
})

defineRouterContext(createRouter()) // omit if route-aware behavior is not needed
</script>

<template>
	<RouterView />
</template>
```

Add resource, auth, authz, notifications, realtime, or i18n contexts at the same root boundary when used.

`defineRouterContext` is only needed for route sync, router helpers, route-derived `resource` / `id` / `action`, or redirect flows that navigate through the router.

> ⚠️ **Warning:** `defineRouterContext` is **optional** — only required when you need route-aware features (redirect after mutation, resource inference from URL). Omit it if your app has no routing needs.

## Rules

- Register `defineQueryClientContext` and `defineFetchersContext` unconditionally at the app root.
- Create the `QueryClient` once at the app root.
- Keep provider wiring in `App.vue`, not inside feature pages.
- Add `defineRouterContext` only when route-aware behavior is actually needed.
- If the app also uses resource inference or multi-backend binding, add `defineControllerContext` at the same root boundary.
