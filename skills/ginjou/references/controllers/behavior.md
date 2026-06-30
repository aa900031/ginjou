# Core Controllers

## Controller Patterns

| Pattern | What it owns |
| --- | --- |
| List controller | Pagination, filters, sorters, total count, route sync when the adapter supports it |
| Infinite-list controller | Load-more or infinite-scroll pagination with page-grouped results |
| Show controller | One-record read flow for a detail page |
| Create controller | Page-level create flow with redirect-aware save behavior |
| Edit controller | Record fetch plus page-level update flow |
| Select controller | Remote option loading and autocomplete-style search |

## List Controller State Model

A list controller combines query results with page state.

| State | Purpose |
| --- | --- |
| Filters | User-controlled filtering plus permanent filters |
| Sorters | User-controlled sorting plus permanent sorters |
| Current page | Current page index |
| Per-page | Page size |
| Total | Total record count |
| Page count | Derived total page count |

When filters, sorters, or page size change, the current page resets to the initial page so the list stays consistent with the new query.

## Filter Behavior

Filters use `FilterOperator` from `@ginjou/core`. Each filter has `field`, `operator`, and `value`.

| Category | Operators |
| --- | --- |
| Equality | `eq`, `ne` |
| Comparison | `lt`, `gt`, `lte`, `gte` |
| Set | `in`, `nin` |
| Text (case-insensitive) | `contains`, `ncontains` |
| Text (case-sensitive) | `containss`, `ncontainss` |
| Range | `between`, `nbetween` |
| Null check | `null`, `nnull` |
| Starts/Ends with | `startswith`, `nstartswith`, `endswith`, `nendswith` (+ `s` suffix variants for case-sensitive) |
| Logical | `or`, `and` (for combining filters into `ConditionalFilter`) |

User-controlled filters support two behaviors:

- `merge` updates the mutable filter set incrementally.
- `replace` replaces the mutable filter set.

Permanent filters stay in the final query either way.

## Sorter Behavior

Sorters do not expose a separate behavior flag. Replacing sorters means
replacing the user-controlled sorter set while still preserving any permanent
sorters.

## Select Pattern

See [Forms](https://ginjou.pages.dev/raw/guides/form.md) for select-controller walkthroughs.

Keep the selected value separate from transient search text and transient search results so the current selection does not disappear when the option list changes.

## Decision Boundary

Use page controllers for standard CRUD pages, and use [data/behavior.md](../data/behavior.md) for dialogs, row actions, widgets, side panels, and other custom orchestration surfaces.

Create and edit mutation timing plus redirect behavior are detailed in [forms/behavior.md](../forms/behavior.md).

## Rules

- Use page controllers for standard list, show, create, edit, and option-loading pages.
- Use the select pattern for remote option loading instead of modeling autocomplete as a list page.
- Preserve permanent filters and permanent sorters when user-controlled state changes.
- Do not invent a sorter `behavior` flag; user-controlled sorter changes replace the mutable sorter set.
- Drop to [data/behavior.md](../data/behavior.md) when the UI is not a standard page surface.
