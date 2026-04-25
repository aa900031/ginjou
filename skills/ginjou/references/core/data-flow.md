# Core Data Flow

## Query Patterns

See [Data](docs/content/1.guides/1.data.md) for the lower-level query model behind controllers.

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

Available invalidation targets are `all`, `resource`, `list`, `many`, and `one`.

| Mutation pattern | Default invalidates |
| --- | --- |
| Create one | `list`, `many` |
| Create many | `list`, `many` |
| Update one | `list`, `many`, `one` |
| Update many | `list`, `many`, `one` |
| Delete one | `list`, `many` |
| Delete many | `list`, `many` |

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
- Run a backend safety check before recommending mutation mode for a non-page flow.
- Do not describe custom mutation as if it had `mutationMode` or standard CRUD invalidation.
