# Router Behavior (core)

## Router Contract

```ts
interface Router {
	go: RouterGoFn<any>
	back: RouterBackFn
	resolve: RouterResolveFn<any>
	getLocation: RouterGetLocationFn<any>
	onChangeLocation: RouterOnChangeLocationFn<any>
	blocker?: RouterBlockerFn
}
```

`go` performs navigation, `back` follows history, `resolve` computes the final
path without navigating, and the location functions expose current route state.
`blocker` is optional; adapters that cannot hold navigation omit it.

## Location Model

```ts
interface RouterLocation<TMeta = unknown> {
	path: string
	params?: Record<string, string | string[]>
	query?: Record<string, string | null | Array<string | null>>
	hash?: string
	meta?: TMeta
}
```

`path` is the canonical location string. `params`, `query`, and `hash` model decoded router state. `meta` lets the adapter attach router-specific metadata.

## Path Resolution Semantics

```ts
interface RouterGoParams<TMeta = unknown> {
	to?: string
	type?: 'push' | 'replace'
	query?: Record<string, string | number | null | undefined>
	hash?: string
	keepHash?: boolean
	keepQuery?: boolean
	meta?: TMeta
}
```

Use `resolve` when the UI needs the final path string first, such as an `href`, preview, or precomputed target. Use `go` when navigation should execute immediately.

## Resource-Intent Navigation

See [Router](https://ginjou.pages.dev/raw/guides/router.md) and [Resources](https://ginjou.pages.dev/raw/guides/resources.md) for route-aware navigation flow.

If no resource definitions exist, keep navigation path-based instead of assuming route inference.

## `keepQuery` And `keepHash`

`keepQuery` reuses the current location query and merges it into the next navigation before explicit `query` values are applied. `keepHash` reuses the current hash only when the next navigation does not provide a new `hash`.

Neither flag implies a second navigation step. They only affect how the next
target is computed.

## Route Blocker

### Contract

```ts
type RouterBlockerFn = (props: RouterBlockerProps) => RouterBlockerController

interface RouterBlockerProps {
	should: RouterBlockShouldFn
	enabled: boolean
}

type RouterBlockShouldFn = (input: {
	currentLocation: RouterLocation
	nextLocation: RouterLocation | undefined
}) => boolean

interface RouterBlockerController {
	readonly state: 'unblocked' | 'blocked' | 'proceeding'
	subscribe: (handler: (state: RouterBlockerStateValues) => void) => () => void
	proceed: () => void
	reset: () => void
	setEnabled: (value: boolean) => void
	dispose: () => void
}
```

`RouterBlockerProps` and `RouterBlockerController` are the adapter-facing shape. App code never calls `router.blocker()` directly; it calls `useRouteBlocker`.

`nextLocation` is `undefined` on page unload.

### Props

App-facing props are `RouteBlocker.Props` in `@ginjou/core`, identical in every framework.

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `shouldBlock` | `boolean \| (input) => boolean` | required | none |
| `enabled` | `boolean` | optional | `true` (`RouteBlocker.defaultEnabled`) |

```ts
import { RouteBlocker } from '@ginjou/core'

// RouteBlocker.State = { Unblocked: 'unblocked', Blocked: 'blocked', Proceeding: 'proceeding' }
// RouteBlocker.StateValues is the union type.
```

`shouldBlock` runs for every navigation the router reports, including query-only ones, so a bare `true` holds all of them. `enabled` is a lifecycle switch deciding whether the blocker takes part at all; it is not the per-navigation condition.

Two things never reach `shouldBlock` under `@ginjou/with-svelte-spa-router`: the first navigation of the session, and a navigation to the exact path and query already displayed. Both are approved without asking any blocker.

### Decision Flow

`proceed()` and `reset()` are no-ops unless state is exactly `'blocked'`. Calling `proceed()` twice silently does nothing the second time. `reset()` cancels the navigation for every participating blocker.

With multiple blockers, each navigation asks every enabled blocker's `shouldBlock` once, then asks the ones that answered `true` for a decision one at a time in registration order; only the blocker being asked is `'blocked'`, queued ones stay `'unblocked'`.

Every outcome settles all participants back to `'unblocked'`, including cancel, router error, and superseding navigation.

> ⚠️ **Warning:** `'proceeding'` is this blocker's own answer, not the navigation's outcome. A later blocker or an app route condition can still cancel it. Do not clear unsaved state on `'proceeding'`.

A blocker registered while a decision is in flight joins the next navigation, not the current one; keep it registered with `enabled: false` and flip it later, since unregistering loses its place in the queue.

`shouldBlock` turning `false` does not settle a decision already in flight; it still needs `proceed()` or `reset()`.

### On Unload

While any enabled `shouldBlock` returns `true`, the browser's own confirmation is used. No navigation is held, blocker state never changes, `proceed` and `reset` are never called, and the message cannot be customized. The `beforeunload` listener is attached lazily, only while at least one enabled blocker exists.

### Without Support

When the router context is missing, or the adapter provides no `blocker`, `useRouteBlocker` is a silent no-op: `state` stays `'unblocked'` and `proceed` / `reset` do nothing. No warning, no throw.

## Rules

- Treat the router as a shared contract, not a framework-specific implementation detail.
- Use path resolution when the UI needs a stable target string before navigation.
- Use resource-intent navigation only when resource definitions are already registered.
- `keepQuery` merges current query state into the next target; explicit next-query values still win.
- `keepHash` only reuses the current hash when the next target omits `hash`.
- Treat `blocker` as optional on the `Router` contract; never assume an adapter supports it.
- Narrow `shouldBlock` yourself when query-only or hash-only navigations must pass.
- Use `enabled` for participation, `shouldBlock` for the per-navigation condition.
- Only call `proceed()` or `reset()` while state is `'blocked'`.
- Do not treat `'proceeding'` as confirmation that the navigation happened.
- Keep a blocker registered with `enabled: false` instead of unregistering it, to preserve queue order.
- Settle an in-flight decision with `proceed()` or `reset()`; flipping `shouldBlock` to `false` does not settle it.
- Do not expect custom unload messages, or blocker state changes, on page unload.
