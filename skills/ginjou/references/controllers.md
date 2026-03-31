# Controllers Reference

Use this reference for standard list pages, table screens, detail pages, infinite list or load-more flows, and select inputs that clearly match high-level CRUD page behavior.

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
const { records, isFetching, currentPage, perPage, total, filters, sorters } = useList({
	resource: 'posts',
	pagination: { current: 1, perPage: 10, mode: 'server' }, // mode: 'server' | 'client' | 'off'
})
currentPage.value = 2 // paginate by writing to the ref, not a setter function
filters.value = [{ field: 'status', operator: 'eq', value: 'published' }]

// useInfiniteList — records is NESTED array of pages, NOT a flat array
const { records, hasNextPage, fetchNextPage } = useInfiniteList({ resource: 'posts' })
// records.value = [ [...page1items], [...page2items] ]
// Correct iteration: v-for="(page, i) in records" then v-for="item in page"
// WRONG:            v-for="item in records"  ← iterates over page arrays, not items

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
```

### `useList`

Use for standard list pages. It manages:

- pagination state
- filters
- sorters
- route synchronization when enabled
- `useGetList` composition under the hood

Prefer `pagination.mode: 'server'` unless the dataset is intentionally small and stable. Client-mode loads all records up front, which breaks performance and perceived responsiveness for any real dataset.

### `useInfiniteList`

Use for load-more or infinite-scroll interfaces. Keep in mind that `records` is page-grouped rather than fully flattened.

### `useShow`

Use for detail pages when the record ID comes from the route. `resource` and `id` are technically optional — they fall back to `useResource()` which reads from Ginjou's resource routing context. **This auto-resolution only works when the route is registered as a Ginjou resource with `action: 'show'`.** When Ginjou resource routing is not configured for the current route, always pass both `resource` and `id` explicitly.

### `useEdit`

Use for edit pages. Returns `record` (the current data), `save()` (triggers the update mutation), and `isPending`. Like `useShow`, `resource` and `id` fall back to `useResource()` — **this only works when the route has Ginjou resource routing with `action: 'edit'`**. When that is not the case, read the id from the route params and pass both `resource` and `id` explicitly:

```typescript
const route = useRoute()
const id = toRef(() => route.params.id as string)
const { record, save, isPending } = useEdit({ resource: 'orders', id })
```

### `useCreate`

Use for create pages. Returns `save()` and `isPending`. There is no `id` parameter. `resource` falls back to `useResource()` when Ginjou resource routing is active; otherwise pass it explicitly.

### `useSelect`

Use when the UI needs option loading, including the common pattern of combining current page results and preselected values.

## Nuxt Counterparts

For SSR-backed Nuxt views, prefer:

- `useAsyncList`
- `useAsyncInfiniteList`
- `useAsyncShow`
- `useAsyncEdit`
- `useAsyncSelect`

These preserve the same conceptual behavior while integrating with Nuxt SSR hydration. `useAsyncCreate` does not exist; use `useCreate` directly in Nuxt as well.

## Controller Decision Rules

- If the page is tied to a route and clearly follows standard CRUD behavior, use a controller.
- If the page is a detail view, use `useShow`.
- If the page is an edit form, use `useEdit`.
- If the page is a create form, use `useCreate`.
- If the page needs standard list state and URL sync, use `useList`.
- If the task says infinite scroll, feed, or load more, use `useInfiniteList`.
- If the component is not a page and only needs raw data, consider the lower-level data composable reference instead.
- If you are not sure whether the user wants CRUD automation, ask before choosing a controller.

## Common Mistakes

- Defaulting to controllers for every page-shaped request without checking whether the workflow is truly standard CRUD.
- Rebuilding pagination, filters, and sorting manually instead of using `useList`.
- **Omitting `resource` and `id` on `useShow` or `useEdit`** and expecting them to be auto-resolved. Auto-resolution requires Ginjou resource routing to be configured (route registered under a Ginjou resource with the matching `action`). When that is not the case, always read the id from `route.params` and pass both `resource` and `id` explicitly.
- Forgetting that `useInfiniteList` returns nested pages.
- Using sync controllers in Nuxt when SSR hydration is part of the requirement.
- Using `useAsyncCreate` — it does not exist. Use `useCreate` directly.

## Authority

- https://ginjou.pages.dev/guides/list
- https://ginjou.pages.dev/integrations/nuxt
