# Controllers Reference

Use this reference for standard list, detail, infinite list, and select flows that clearly match high-level CRUD page behavior.

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
currentPage.value = 2  // paginate by writing to the ref, not a setter function
filters.value = [{ field: 'status', operator: 'eq', value: 'published' }]

// useInfiniteList — records is NESTED array of pages, NOT a flat array
const { records, hasNextPage, fetchNextPage } = useInfiniteList({ resource: 'posts' })
// records.value = [ [...page1items], [...page2items] ]
// Correct iteration: v-for="(page, i) in records" then v-for="item in page"
// WRONG:            v-for="item in records"  ← iterates over page arrays, not items

// useShow — resolves id from current route automatically
const { record, isFetching } = useShow()  // no id prop needed; reads from route
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

Use for detail pages when the record ID comes from the route. Drop to `useGetOne` only when the ID comes from some other source or when the view needs finer control over the query lifecycle.

### `useSelect`

Use when the UI needs option loading, including the common pattern of combining current page results and preselected values.

## Nuxt Counterparts

For SSR-backed Nuxt views, prefer:

- `useAsyncList`
- `useAsyncInfiniteList`
- `useAsyncShow`
- `useAsyncSelect`

These preserve the same conceptual behavior while integrating with Nuxt SSR hydration.

## Controller Decision Rules

- If the page is tied to a route and clearly follows standard CRUD behavior, use a controller.
- If the route should drive the record ID, use `useShow`.
- If the page needs standard list state and URL sync, use `useList`.
- If the task says infinite scroll, feed, or load more, use `useInfiniteList`.
- If the component is not a page and only needs raw data, consider the lower-level data composable reference instead.
- If you are not sure whether the user wants CRUD automation, ask before choosing a controller.

## Common Mistakes

- Defaulting to controllers for every page-shaped request without checking whether the workflow is truly standard CRUD.
- Rebuilding pagination, filters, and sorting manually instead of using `useList`.
- Using `useGetOne` on a route-driven detail page where `useShow` would resolve the ID automatically.
- Forgetting that `useInfiniteList` returns nested pages.
- Using sync controllers in Nuxt when SSR hydration is part of the requirement.

## Authority

- https://ginjou.pages.dev/guides/list
- https://ginjou.pages.dev/integrations/nuxt
