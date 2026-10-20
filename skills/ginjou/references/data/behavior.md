# Core Data Flow

## Query Patterns

See [Data](https://ginjou.pages.dev/raw/guides/data.md) for the lower-level query model behind controllers.

| Query pattern | Use it for |
| --- | --- |
| List query | Fetch a list without page-controller state |
| One-record query | Fetch one record by id |
| Many-record query | Fetch multiple records by id set |
| Infinite-list query | Infinite pagination without page-controller behavior |
| Custom query | Read from a non-resource endpoint when the backend adapter supports it |

## Mutation Patterns

| Mutation pattern | Use it for |
| --- | --- |
| Create one / many | Non-page create flows |
| Update one / many | Inline edits, dialogs, row actions, bulk updates |
| Delete one / many | Row actions, dialogs, destructive bulk operations |
| Custom mutation | Non-CRUD write endpoints when the backend adapter supports them |

## Query And Mutation Options

- Query options cover `enabled`, retry behavior, placeholder data, callbacks, and other read-side controls.
- Mutation options cover lifecycle callbacks and mutation-specific settings.

## Cache Invalidation

Targets are `all`, `resource`, `list`, `many`, and `one`. `all` covers every
query of **one fetcher**, not every fetcher.

| Mutation pattern | Default invalidates |
| --- | --- |
| Create one / many | `list`, `many` |
| Update one / many | `list`, `many`, `one` |
| Delete one / many | `list`, `many` |

A rule is either a target string or an object for an explicit target:

| Rule | Invalidates |
| --- | --- |
| `'all'` / `'resource'` / `'list'` | same as the object form, using the call's `resource` / `fetcherName` |
| `'many'` | every many query whose `ids` contain an affected ID (any order, any `meta`) |
| `'one'` | the one queries of every affected ID, whatever their `meta` |
| `{ target: 'all', fetcherName? }` | every query of one fetcher |
| `{ target: 'resource', resource, fetcherName? }` | **every** list/one/many query of that resource |
| `{ target: 'list', resource, fetcherName? }` | only the list + infinite-list queries |
| `{ target: 'many', resource, ids, fetcherName?, meta? }` | many query with exactly these ordered `ids` |
| `{ target: 'one', resource, id \| ids, fetcherName?, meta? }` | one query/queries for these IDs |

"Affected IDs" are the mutation's `id` / `ids` plus every ID in the result.
String `'one'` / `'many'` rules need that mutation context, so they only work
inside mutations; outside one they throw — use object rules. They ignore the
mutation's `meta` (it describes the write, not the cached reads). Object rules
fall back to the mutation's `fetcherName`; with `meta` they match only queries
carrying that exact `meta`, without it they match every `meta`. Object `one`
rules take exactly one of `id` or `ids`.

IDs match by query key, so they must mirror the query:

- `one`: `id` is used raw. A query keyed on `'1'` (route param) is **not**
  matched by `id: 1`. Match the type the read composable was given.
- Object `many`: `ids` is compared as an ordered list; `ids: [2, 1]` misses a
  query fetched with `ids: [1, 2]`. The string `'many'` has no such limit.
- A string `'many'` predicate is skipped when `queryFilters.predicate` is set;
  the user predicate wins.
- A mismatch is silent — no error, stale cache. Use `'resource'` when unsure.

Every target except `all` needs a `resource`, from the rule, the call, or the
hook/mutation props; missing one throws.

Passing an array **replaces** the defaults. Pass a callback to keep them, or
`false` to invalidate nothing:

```ts
invalidates: ({ defaults }) => [
	...(defaults?.invalidates || []),
	{ target: 'resource', resource: 'comments' },
]
```

The callback gets one context object `{ defaults, data, props }`:
`defaults.invalidates` is the mutation's default rule array, `data` the
mutation result (`undefined` on failure), `props` the resolved mutation props.
Use `data` to target related records the server returned, e.g.
`{ target: 'one', resource: 'posts', id: data.data.postId }` after creating a
comment.

Any of these can also be `{ rules, queryFilters?, options? }` (callbacks may
return it too). `queryFilters` / `options` are TanStack `invalidateQueries`
filters (minus `queryKey`) and options; each **replaces** its default
(`{ type: 'all', refetchType: 'active' }` / `{ cancelRefetch: false }`) entirely.

Outside a mutation, use `useQueryInvalidate` (see the framework leaf).

## Mutation-Mode Safety Gate

1. Confirm backend mutation reliability and error behavior.
2. Default to `pessimistic` if backend guarantees are unclear.
3. Use `undoable` only when notification capability already exists.

Do not assume mutation guarantees are interchangeable across REST API, Supabase, and Directus adapters.

## Custom Mutation Boundary

- no `mutationMode`
- no built-in CRUD invalidation presets

## Rules

- Use the data-flow layer for dialogs, widgets, row actions, side panels, and custom endpoints.
- Prefer page controllers only when the UI is a standard CRUD page.
- Adjust `invalidates` deliberately instead of assuming every mutation should refresh everything.
- Extend the defaults with the callback form; a bare array replaces them.
- Run a backend safety check before recommending mutation mode for a non-page flow.
- Do not describe custom mutation as if it had `mutationMode` or standard CRUD invalidation.
