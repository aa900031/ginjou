# Vue Router

Use this reference for Vue router wiring and router helper composables. See [Router](https://ginjou.pages.dev/raw/guides/router.md) for guide-level usage. See [core/router.md](../core/router.md) for contract semantics, location shape, and `keepQuery` / `keepHash`.

## Register Router Context

Use `defineRouterContext` once near app setup.

```vue
<script setup lang="ts">
import { defineRouterContext } from '@ginjou/vue'
import { createRouter } from '@ginjou/with-vue-router'

defineRouterContext(createRouter())
</script>
```

`createRouter` from `@ginjou/with-vue-router` is the documented adapter for Vue Router applications. A custom adapter is also valid when it implements the core `Router` contract.

## Helpers

| Helper | Purpose |
| --- | --- |
| `useGo()` | Run raw navigation with `RouterGoParams`. |
| `useBack()` | Follow browser or router history. |
| `useLocation()` | Read reactive current-location state. |
| `useResolvePath()` | Compute the final path string without navigating. |
| `useNavigateTo()` | Navigate from resource intent or raw router params. |

> ⚠️ **Warning:** When navigating after mutations, use `keepQuery: true` and `keepHash: true` to preserve the current URL's query string and hash fragment. These parameters are available on both `useGo` and `useNavigateTo`.

## `useGo`

`useGo()` is the raw router helper and the most direct way to preserve the current URL state during navigation.

```ts
import { useGo } from '@ginjou/vue'

const go = useGo()
go({ to: '/posts', keepQuery: true, keepHash: true })
```

Use `keepQuery` when the next target should inherit the current query string, and `keepHash` when the next target should reuse the current hash fragment.

## `useNavigateTo`

`useNavigateTo()` is the high-level helper for resource-aware navigation.

```vue
<script setup lang="ts">
import { ResourceAction } from '@ginjou/core'
import { useNavigateTo } from '@ginjou/vue'

const navigateTo = useNavigateTo({ resource: 'posts' })

navigateTo({ action: ResourceAction.Type.Create })
navigateTo({ action: ResourceAction.Type.Show, id: 42 })
</script>
```

Action-based navigation depends on registered resources. Pair this file with [Resources](https://ginjou.pages.dev/raw/guides/resources.md) and [core/resources.md](../core/resources.md) when inference matters.

```ts
import { useGo, useNavigateTo } from '@ginjou/vue'

const go = useGo()
go({ to: '/posts', keepQuery: true, keepHash: true })

const navigateTo = useNavigateTo()
navigateTo({ to: '/posts', keepQuery: true, keepHash: true })
```

`keepQuery` merges the current query into the next target before explicit `query` values are applied. `keepHash` reuses the current hash only when the next target omits `hash`.

When a `useNavigateTo()` call needs `keepQuery` or `keepHash`, pass raw router params instead of an action-based resource target.

## Context Presence Behavior

| Helper | Behavior without router context |
| --- | --- |
| `useGo()` | Safe no-op |
| `useBack()` | Safe no-op |
| `useLocation()` | Returns a ref whose value stays `undefined` |
| `useResolvePath()` | Throws |

## Rules

- Register `defineRouterContext` once near app setup.
- Use `useGo` and `useBack` for raw router behavior.
- Use `useResolvePath` when the UI needs a resolved string target before navigation.
- Use `useNavigateTo` when navigation depends on resource action, `id`, or resource-bound paths.
- Do not assume action-based navigation works without registered resources.
