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

A rule is either a target string (broad — every query of that target) or an
object for an exact target:

| Rule | Invalidates |
| --- | --- |
| `'list'` | broad; string form of any target |
| `{ target: 'all', fetcherName? }` | every query of one fetcher |
| `{ target: 'resource', resource, fetcherName? }` | **every** list/one/many query of that resource |
| `{ target: 'list', resource, fetcherName? }` | only the list + infinite-list queries |
| `{ target: 'many', resource, ids, fetcherName?, meta? }` | exact many query |
| `{ target: 'one', resource, id \| ids, fetcherName?, meta? }` | exact one query/queries |

Object rules fall back to the mutation's `fetcherName`, but **not** its `meta` —
pass `meta` on the rule when the target queries carry one. `one` rules take
exactly one of `id` or `ids`.

Exact rules match by query key, so they must mirror the query exactly:

- `one`: `id` is used raw. A query keyed on `'1'` (route param) is **not**
  matched by `id: 1`. Match the type the read composable was given.
- `many`: `ids` is compared as an ordered list; `ids: [2, 1]` misses a query
  fetched with `ids: [1, 2]`.
- Either way a mismatch is silent — no error, stale cache. Use the string form
  (`'one'` / `'many'`) when unsure.

Every target except `all` needs a `resource`, from the rule, the call, or the
hook/mutation props; missing one throws.

Passing an array **replaces** the defaults. Pass a callback to keep them, or
`false` to invalidate nothing:

```ts
invalidates: defaults => [
	...(defaults || []),
	{ target: 'resource', resource: 'comments' },
]
```

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
