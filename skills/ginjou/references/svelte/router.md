# Svelte Router

Router wiring and navigation helpers for Svelte 5. **The helper names
(`useGo`, `useBack`, `useNavigateTo`, `useLocation`, `useResolvePath`),
`keepQuery`/`keepHash` behavior, and context-presence rules match Vue** — read
[vue/router.md](../vue/router.md) and [core/router.md](../core/router.md). This
file pins the Svelte syntax and the one real adapter difference.

## Adapter difference

Vue uses `@ginjou/with-vue-router`. **Svelte uses a Svelte router adapter** —
`@ginjou/with-svelte-spa-router` binds `svelte-spa-router` to the core router
contract. Register it once at the root:

```svelte
<script lang="ts">
import { defineRouterContext } from '@ginjou/svelte'
import { createRouter } from '@ginjou/with-svelte-spa-router'

defineRouterContext(createRouter())
</script>
```

A custom adapter implementing the core `Router` contract is also valid.

## Helpers

```svelte
<script lang="ts">
import { useGo, useNavigateTo } from '@ginjou/svelte'

const go = useGo()
const navigateTo = useNavigateTo({ resource: 'posts' })

// go({ to: '/posts', keepQuery: true, keepHash: true })
// navigateTo({ action: ResourceAction.Type.Create })
</script>
```

`useLocation()` exposes reactive location state — read it directly (no `.value`).
Context-presence behavior is identical to Vue: `useGo`/`useBack` no-op without a
router context, `useLocation` stays `undefined`, `useResolvePath` throws.

## Rules

- Use `@ginjou/with-svelte-spa-router` (or a custom core-contract adapter), not the Vue router adapter.
- Use `keepQuery`/`keepHash` on `useGo`/`useNavigateTo` when navigation after a mutation must preserve the URL.
- Action-based `useNavigateTo` needs registered resources (see [svelte/resources.md](./resources.md)).
