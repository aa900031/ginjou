# Router Behavior (core)

## Router Contract

```ts
interface Router {
	go: RouterGoFn<any>
	back: RouterBackFn
	resolve: RouterResolveFn<any>
	getLocation: RouterGetLocationFn<any>
	onChangeLocation: RouterOnChangeLocationFn<any>
}
```

`go` performs navigation, `back` follows history, `resolve` computes the final
path without navigating, and the location functions expose current route state.

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

## Rules

- Treat the router as a shared contract, not a framework-specific implementation detail.
- Use path resolution when the UI needs a stable target string before navigation.
- Use resource-intent navigation only when resource definitions are already registered.
- `keepQuery` merges current query state into the next target; explicit next-query values still win.
- `keepHash` only reuses the current hash when the next target omits `hash`.
