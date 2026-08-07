# Vue Router

Use this reference for Vue router wiring and router helper composables. See [Router](https://ginjou.pages.dev/raw/guides/router.md) for guide-level usage. See [behavior.md](./behavior.md) for contract semantics, location shape, and `keepQuery` / `keepHash`.

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
| `useRouteBlocker()` | Hold navigation while local state is unsaved. |

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

Action-based navigation depends on registered resources. Pair this file with [Resources](https://ginjou.pages.dev/raw/guides/resources.md) and [../resources/behavior.md](../resources/behavior.md) when inference matters.

```ts
import { useGo, useNavigateTo } from '@ginjou/vue'

const go = useGo()
go({ to: '/posts', keepQuery: true, keepHash: true })

const navigateTo = useNavigateTo()
navigateTo({ to: '/posts', keepQuery: true, keepHash: true })
```

`keepQuery` merges the current query into the next target before explicit `query` values are applied. `keepHash` reuses the current hash only when the next target omits `hash`.

When a `useNavigateTo()` call needs `keepQuery` or `keepHash`, pass raw router params instead of an action-based resource target.

## `useRouteBlocker`

`useRouteBlocker(props, context?)` from `@ginjou/vue`. Props are `ToMaybeRefs<RouteBlocker.Props>`, so every field accepts a value or a `Ref`. See [behavior.md](./behavior.md) for prop, state, and decision semantics.

```ts
interface UseRouteBlockerResult {
	state: Ref<RouteBlocker.StateValues>
	proceed: () => void
	reset: () => void
}
```

`state` is a readonly `Ref` and needs `.value` in script. Destructure the return value so a template auto-unwraps it; `blocker.state` on a nested object is not auto-unwrapped.

```vue
<script setup lang="ts">
import { RouteBlocker } from '@ginjou/core'
import { useRouteBlocker } from '@ginjou/vue'
import { ref } from 'vue'

const dirty = ref(false)

const { state, proceed, reset } = useRouteBlocker({
	shouldBlock: ({ currentLocation, nextLocation }) =>
		dirty.value && nextLocation?.path !== currentLocation.path,
})
</script>

<template>
	<dialog :open="state === RouteBlocker.State.Blocked">
		<p>Unsaved changes will be lost.</p>
		<button @click="reset()">
			Stay
		</button>
		<button @click="proceed()">
			Leave
		</button>
	</dialog>
</template>
```

> ⚠️ **Warning:** With `@ginjou/with-vue-router`, call `useRouteBlocker`, `useWarnUnsaved`, and `useLocation` synchronously during `setup`. The adapter asserts `getCurrentInstance() != null` and throws ``[@ginjou/with-vue-router] `blocker` binds component lifecycle hooks, so it has to be called during a component's setup.`` — so a watcher body, a plain async callback, or module scope throws. A lifecycle hook such as `onMounted` does not throw, but registering there still breaks the `KeepAlive` handling below.

The adapter registers `onActivated` / `onDeactivated` at registration time, so a blocker inside a deactivated `KeepAlive` component is not asked, and is asked again on activation.

### Comparing Vue Router Locations

Comparing `path` alone is often not enough:

| Navigation | Should block |
| --- | --- |
| `/posts/1/edit` → `/posts/2/edit` | Yes, same route record, different record shown |
| `/posts/1/edit` → `/posts/1/edit/preview` | No, child route |
| `/posts/1` → `/p/1` | No, alias |

`meta.location` carries Vue Router's normalized location, including `matched` and `params`. An alias resolves to its own record with the original under `aliasOf`. Copy the `isLeavingRoute` predicate from [vue-router](https://ginjou.pages.dev/raw/adapters/vue-router.md) rather than writing one; the package exports no such helper.

## Context Presence Behavior

| Helper | Behavior without router context |
| --- | --- |
| `useGo()` | Safe no-op |
| `useBack()` | Safe no-op |
| `useLocation()` | Returns a ref whose value stays `undefined` |
| `useResolvePath()` | Throws |
| `useRouteBlocker()` | Silent no-op, `state` stays `'unblocked'` |

## Rules

- Register `defineRouterContext` once near app setup.
- Use `useGo` and `useBack` for raw router behavior.
- Use `useResolvePath` when the UI needs a resolved string target before navigation.
- Use `useNavigateTo` when navigation depends on resource action, `id`, or resource-bound paths.
- Do not assume action-based navigation works without registered resources.
- Call `useRouteBlocker`, `useWarnUnsaved`, and `useLocation` synchronously during `setup`; never from a watcher body, an async callback, or module scope.
- Destructure `useRouteBlocker`'s return value when the template reads `state`.
- Read `state.value` in script, `state` in template.
- Use `meta.location` for route-record comparison instead of comparing `path` strings.
