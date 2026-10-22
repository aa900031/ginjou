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

| Mutation pattern | Default invalidates | Runs |
| --- | --- | --- |
| Create one / many | `list` | on success only |
| Update one / many | `list`, `many`, `one` | on settled (success **or** failure) |
| Delete one / many | `list`, `many` | on settled (success **or** failure) |

Create skips `many`: a new ID can't be in a many query fetched before the record
existed. Add it back (`invalidates: ['list', 'many']`) only when the app fetches
an ID before creating it, e.g. client-generated UUIDs.

A rule is either a target string or an object for an explicit target:

| Rule | Invalidates |
| --- | --- |
| `'all'` / `'resource'` / `'list'` | same as the object form, using the call's `resource` / `fetcherName` |
| `'many'` | with IDs: every many query whose `ids` contain one of them (any order, any `meta`); without: every many query of the resource |
| `'one'` | the one queries of every ID, whatever their `meta` (skipped with a `console.warn` without IDs) |
| `{ target: 'all', fetcherName? }` | every query of one fetcher |
| `{ target: 'resource', resource?, fetcherName? }` | **every** list/one/many query of that resource |
| `{ target: 'list', resource?, fetcherName? }` | only the list + infinite-list queries |
| `{ target: 'many', resource?, ids?, fetcherName?, meta? }` | many query with exactly these ordered `ids`; every many query of the resource when `ids` is omitted; nothing when `ids: []` |
| `{ target: 'one', resource?, id \| ids, fetcherName?, meta? }` | one query/queries for these IDs |

String `'one'` / `'many'` use the affected IDs, which the invalidation collects
from the result `data` it receives (one record or a list) plus the `id` / `ids`
props. Mutations pass both for you; elsewhere pass the IDs as props:
`invalidate({ resource: 'posts', id: 1, invalidates: ['one'] })`. A `data` you
pass yourself must have the mutation result shape (`{ data: record }` /
`{ data: records }`); a bare record contributes no IDs.
Without IDs, `'one'` is skipped with a `console.warn` and `'many'` invalidates
every many query of the resource. They ignore the mutation's `meta` (it
describes the write, not the cached reads). Object rules
fall back to the mutation's `fetcherName`; with `meta` they match queries whose
`meta` contains those fields (subset: `{ lang: 'en' }` also matches
`{ lang: 'en', fields }`, not a query without `meta`), without it they match
every `meta`. Object `one`
rules take exactly one of `id` or `ids`.

IDs match by query key, so they must mirror the query:

- `one` matches the raw ID value: `id: 1` does **not** match a query keyed on
  `'1'` (route param). Pass the same type the read composable was given. `many`
  compares IDs as strings.
- Object `many`: `ids` is compared as an ordered list; `ids: [2, 1]` misses a
  query fetched with `ids: [1, 2]`. The string `'many'` has no such limit.
- `filters` can only narrow a rule: a `predicate` must match together with the
  rule's own ID / `meta` matching, and the rule keeps its own `queryKey` and
  `exact`. To match queries by your own condition, use
  `{ rules: ['resource'], filters: { predicate } }`.
- A mismatch is silent — no error, stale cache. Use `'resource'` when unsure.

Every target except `all` needs a `resource`, from the rule, the call, or the
hook/mutation props; missing one throws.

Passing `invalidates` **replaces** the defaults — list the defaults you still
want next to the extra rules, or pass `false` to invalidate nothing:

```ts
invalidates: ['list', 'many', 'one', { target: 'resource', resource: 'comments' }]
```

A callback gets `{ ids, data }` (no defaults, no
mutation props): `ids` the affected IDs, `data` the mutation result. To
invalidate based on `mutate` variables, call `useQueryInvalidate()` during
setup (it is a composable) and call the returned `invalidate` from that call's
`onSuccess`. Update/delete callbacks
also run on failure with `data` `undefined` — guard it (`data ? [...] : []`);
an error thrown while invalidating does not fail the mutation — it is logged with
`console.error` and that invalidation is skipped.
Use `data` to target related records the server returned, e.g.
`...(data?.data.postId != null ? [{ target: 'one', resource: 'posts', id: data.data.postId }] : [])`
after creating a comment. Every rule must be valid — all rules are checked
before any runs, so one invalid rule (e.g. `{ target: 'one', id: undefined }`)
cancels the whole invalidation, defaults included. Only add a rule once its ID
is known.

Any of these can also be `{ rules, filters?, options? }` (callbacks may
return it too). `filters` / `options` are TanStack `invalidateQueries`
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
- Passing `invalidates` replaces the defaults; repeat the defaults you still need.
- Run a backend safety check before recommending mutation mode for a non-page flow.
- Do not describe custom mutation as if it had `mutationMode` or standard CRUD invalidation.
