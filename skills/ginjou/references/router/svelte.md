# Svelte Router

Router wiring and navigation helpers for Svelte 5. **The helper names
(`useGo`, `useBack`, `useNavigateTo`, `useLocation`, `useResolvePath`),
`keepQuery`/`keepHash` behavior, and context-presence rules match Vue** — read
[vue.md](./vue.md) and [behavior.md](./behavior.md). This
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

`createRouter(options?)` accepts `parseQuery` / `stringifyQuery`, both defaulting
to `URLSearchParams`-based implementations that collect repeated keys into an
array. Using the route blocker needs three more things wired by hand — see
[Blocker wiring](#blocker-wiring).

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

`useLocation()` returns a `ReadonlyBox` — read it through `.value`
(`location.value?.path`). Context-presence behavior is identical to Vue:
`useGo`/`useBack` no-op without a router context, `useLocation` stays
`undefined`, `useRouteBlocker` is a silent no-op with `state` stuck at
`'unblocked'`, `useResolvePath` throws.

`resolve()` returns a bare path like `/posts?page=2` with no `#` prefix; an
`<a href>` needs one added.

## Route blocker

Shared blocker model (state machine, `proceed`/`reset` semantics, multi-blocker
ordering, unload behavior) is in [behavior.md](./behavior.md). Svelte deltas:

`useRouteBlocker(props, context?)` from `@ginjou/svelte`. Props are
`MaybeAccessor<RouteBlocker.Props>` — the **whole object**, or a getter
returning it (unlike Vue, where each field may be a ref).

```ts
interface UseRouteBlockerResult {
	readonly state: RouteBlocker.StateValues
	proceed: () => void
	reset: () => void
}
```

`state` is a bare getter — read `blocker.state`, **no `.value`**; `useLocation()`
is a box needing `.value`.

```svelte
<script lang="ts">
import { RouteBlocker } from '@ginjou/core'
import { useRouteBlocker } from '@ginjou/svelte'

let dirty = $state(false)

const blocker = useRouteBlocker(() => ({
	enabled: dirty,
	shouldBlock: ({ currentLocation, nextLocation }) =>
		nextLocation?.path !== currentLocation.path,
}))
</script>

<dialog open={blocker.state === RouteBlocker.State.Blocked}>
	<button onclick={blocker.reset}>Stay</button>
	<button onclick={blocker.proceed}>Leave</button>
</dialog>
```

> ⚠️ **Warning:** Destructuring kills reactivity: `const { state } =
> useRouteBlocker(...)` snapshots the getter once. Keep `blocker.state`.

A dynamic `enabled` **must** be passed as a getter, as above. A plain object
literal is never re-read, so `setEnabled` never fires and the enabled state is
frozen at its initial value. A `shouldBlock` closure reading `$state` is fine
either way — it is called at navigation time.

## Blocker wiring

`@ginjou/with-svelte-spa-router` has no global hooks, so unlike Vue Router the
blocker needs three things wired into the app's own `<Router>` by hand.

> ⚠️ **Warning:** Without them there is no error, no warning, and no type
> error.

```svelte
<script lang="ts">
import { defineRouterContext } from '@ginjou/svelte'
import { createRouter } from '@ginjou/with-svelte-spa-router'
import Router from 'svelte-spa-router'
import { routes } from './routes'

const router = createRouter()
defineRouterContext(router)

const blockableRoutes = router.withBlocker(routes)
</script>

<Router
	routes={blockableRoutes}
	onRouteLoaded={router.onRouteLoaded}
	onConditionsFailed={router.onConditionsFailed}
/>
```

| Piece | Signature | What it does | If omitted |
| --- | --- | --- | --- |
| `withBlocker` | `<T extends RouteDefinition>(routes: T) => T` | returns a new route table with the blocker condition prepended; the original is untouched and `wrap`ped routes keep their own options | nothing ever blocks |
| `onRouteLoaded` | `(detail: RouteDetailLoaded) => void` | ends a navigation that reached its route | an approving blocker stays `'proceeding'` until the next blocked navigation |
| `onConditionsFailed` | `(detail: RouteDetail) => void` | ends a navigation one of the app's own route conditions rejected, and rolls the reported location back | same, plus `getLocation()` reports a route nothing mounted |

Approving is not arriving: an app condition can still reject a navigation the
blocker let through — that is what `onConditionsFailed` is for.

This adapter's locations carry no `meta`, so the Vue-Router `matched`/`aliasOf`
predicate is unavailable; compare `path` and `params` from the two
`RouterLocation`s instead.

See [adapters/svelte-spa-router](https://ginjou.pages.dev/raw/adapters/svelte-spa-router.md)
and [guides/router](https://ginjou.pages.dev/raw/guides/router.md).

## Rules

- Use `@ginjou/with-svelte-spa-router` (or a custom core-contract adapter), not the Vue router adapter.
- Use `keepQuery`/`keepHash` on `useGo`/`useNavigateTo` when navigation after a mutation must preserve the URL.
- Action-based `useNavigateTo` needs registered resources (see [../resources/svelte.md](../resources/svelte.md)).
- Read `useLocation()` through `.value`; read `useRouteBlocker().state` bare.
- Never destructure a `useRouteBlocker` result — keep `blocker.state`.
- Pass `useRouteBlocker` props as a getter whenever `enabled` is dynamic; a plain object literal freezes it.
- Using the blocker requires all three of `withBlocker`, `onRouteLoaded`, and `onConditionsFailed` on the app's `<Router>` — omitting any fails silently.
- Prefix `resolve()` output with `#` before using it as an `<a href>`.
