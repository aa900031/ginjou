# Controllers Reference

Use this reference for standard list pages, table screens, detail pages, infinite list or load-more flows, and select or autocomplete option loading that clearly match high-level CRUD behavior.

## Use Controllers Only For Clear CRUD Flows

Start with controllers only when the task clearly describes a conventional CRUD page such as:

- list page with ordinary page state
- detail page with route-driven or clearly defined record lookup
- infinite scroll page with standard resource-backed pagination
- select/autocomplete options fed from a standard resource-backed query

If the task does not clearly fit that shape, stop and ask the user before defaulting to controllers. When the user wants finer control or the workflow is not obviously CRUD, move to the data composables reference instead.

## Key Shapes

```typescript
// useList — currentPage and perPage are WRITABLE refs (assign .value to paginate)
const { records, isFetching, currentPage, perPage, total, pageCount, filters, sorters } = useList({
  resource: 'posts',
  pagination: { current: 1, perPage: 10, mode: 'server' }, // mode: 'server' | 'client' | 'off'
  syncRoute: true, // syncs pagination/filters/sorters with URL query string
})
currentPage.value = 2  // paginate by assigning to the ref
filters.value = [{ field: 'status', operator: FilterOperator.eq, value: 'published' }]
sorters.value = [{ field: 'createdAt', order: 'desc' }]

// useInfiniteList — records is NESTED array of pages, NOT a flat array
const { records, hasNextPage, fetchNextPage, perPage } = useInfiniteList({ resource: 'posts' })
// records.value = [ [...page1items], [...page2items] ]
// Correct iteration:
// v-for="(page, i) in records"
//   v-for="item in page"
// WRONG: v-for="item in records"  ← iterates over page arrays, not items

// useShow — resource and id are optional ONLY when Ginjou resource routing is active
// (i.e. the route is registered under a Ginjou resource with action 'show').
// When Ginjou resource routing is NOT configured, provide both explicitly:
const route = useRoute()
const id = toRef(() => route.params.id as string)
const { record, isFetching } = useShow({ resource: 'posts', id })

// useEdit — same rule as useShow: resource and id are NOT auto-resolved unless
// Ginjou resource routing is configured with action 'edit' for this route.
// Always pass resource and id explicitly when resource routing is not set up:
const { record, save, isPending } = useEdit({ resource: 'posts', id })
// save() accepts a partial payload and triggers the mutation:
await save({ title: 'New title' })

// useCreate — resource is optional when Ginjou resource routing is active,
// otherwise pass it explicitly. Returns a save() function (no id needed).
const { save, isPending } = useCreate({ resource: 'posts' })
await save({ title: 'New post' })

// useSelect — for select/autocomplete option loading
const value = ref<string>()
const { options, search } = useSelect({
  resource: 'posts',
  value, // pre-selected value — ensures its option is always present in the list
})
// search is writable: search.value = 'keyword' to filter options
```

## `useList`

Use for standard list pages. It manages:

- pagination state (`currentPage`, `perPage`, `total`, `pageCount`)
- filters (`filters` — writable ref)
- sorters (`sorters` — writable ref)
- route synchronization when `syncRoute: true`
- composes `useGetList` under the hood

Prefer `pagination.mode: 'server'` unless the dataset is intentionally small and stable. Client-mode loads all records up front, which breaks performance for any real dataset.

Use `FilterOperator` from `@ginjou/core` for filter operator constants (`eq`, `ne`, `contains`, `in`, etc.).

## `useInfiniteList`

Use for load-more or infinite-scroll interfaces. `records` is page-grouped, not flat. Always use a nested `v-for` to iterate:

```vue
<template v-for="(page, i) in records" :key="i">
  <tr v-for="item in page" :key="item.id">
    ...
  </tr>
</template>
```

## `useShow`

Use for detail pages when the record ID comes from the route. `resource` and `id` are **optional** — they fall back to `useResource()` which reads from Ginjou's resource routing context. **This auto-resolution only works when the route is registered as a Ginjou resource with `action: 'show'`.** When Ginjou resource routing is not configured for the current route, always pass both `resource` and `id` explicitly.

## `useEdit`

Use for edit pages. Returns `record` (fetched data), `save()` (triggers the update mutation), `isPending`, and `isLoading`. Like `useShow`, `resource` and `id` will fall back to `useResource()` **only when Ginjou resource routing is active with `action: 'edit'`**. When that is not set up, read the id from route params and pass both explicitly:

```typescript
const route = useRoute()
const id = toRef(() => route.params.id as string)
const { record, save, isPending } = useEdit({ resource: 'orders', id })
```

## `useCreate`

Use for create pages. Returns `save()` and `isPending`. There is no `id` parameter. `resource` falls back to `useResource()` when Ginjou resource routing is active; otherwise pass it explicitly.

## `useSelect`

Use when the UI needs select or autocomplete option loading, including the pattern where a current selection must remain visible even when it falls outside the current page of results. Pass `value` to ensure the selected option is always present.

```typescript
const { options, search, currentPage, perPage } = useSelect({
  resource: 'posts',
  value,
  labelKey: 'title', // default label field
  valueKey: 'id',    // default value field
})
```

## Nuxt Counterparts

For SSR-backed Nuxt views, prefer:

| Vue | Nuxt SSR |
| --- | --- |
| `useList` | `useAsyncList` |
| `useInfiniteList` | `useAsyncInfiniteList` |
| `useShow` | `useAsyncShow` |
| `useEdit` | `useAsyncEdit` |
| `useSelect` | `useAsyncSelect` |

`useAsyncCreate` does **not** exist. Use `useCreate` directly in Nuxt as well.

## Controller Decision Rules

- If the page follows standard list behavior with pagination/filters/sort, use `useList`.
- If the page is a detail view, use `useShow`.
- If the page is an edit form, use `useEdit`.
- If the page is a create form, use `useCreate`.
- If the task says "infinite scroll", "feed", or "load more", use `useInfiniteList`.
- If the component is not a page and only needs raw data, use lower-level data composables instead.
- If you are not sure whether the user wants CRUD automation, ask before choosing a controller.

## Common Mistakes

- Defaulting to controllers for every page-shaped request without checking whether the workflow is truly standard CRUD.
- Rebuilding pagination, filters, and sorting manually instead of using `useList`.
- **Omitting `resource` and `id` on `useShow` or `useEdit`** and expecting auto-resolution when Ginjou resource routing is not configured.
- Forgetting that `useInfiniteList` returns nested pages — iterating `records` directly gives pages, not items.
- Using sync controllers in Nuxt when SSR hydration is part of the requirement.
- Using `useAsyncCreate` — it does not exist. Use `useCreate` directly.

## Authority

- https://ginjou.pages.dev/guides/list
- https://ginjou.pages.dev/integrations/nuxt
