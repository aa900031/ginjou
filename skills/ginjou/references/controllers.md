# Controllers Reference

Use this reference for standard list, detail, infinite list, and select flows that should be driven by high-level page composables.

## Choose Controllers First

Start with controllers when the task describes a conventional page:

- list page
- detail page
- infinite scroll page
- select/autocomplete options fed from a resource

Controllers should be the default because they already compose resource context, query state, route synchronization, and query helpers.

## Main Controllers

### `useList`

Use for standard list pages. It manages:

- pagination state
- filters
- sorters
- route synchronization when enabled
- `useGetList` composition under the hood

Prefer `pagination.mode: 'server'` unless the dataset is intentionally small and stable.

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

- If the page is tied to a route and follows standard CRUD behavior, use a controller.
- If the route should drive the record ID, use `useShow`.
- If the page needs standard list state and URL sync, use `useList`.
- If the task says infinite scroll, feed, or load more, use `useInfiniteList`.
- If the component is not a page and only needs raw data, consider the lower-level data composable reference instead.

## Common Mistakes

- Rebuilding pagination, filters, and sorting manually instead of using `useList`.
- Using `useGetOne` on a route-driven detail page where `useShow` would resolve the ID automatically.
- Forgetting that `useInfiniteList` returns nested pages.
- Using sync controllers in Nuxt when SSR hydration is part of the requirement.

## Authority

- `docs/content/1.guides/3.list.md`
- `docs/content/1.guides/2.form.md`
- `docs/content/2.integrations/1.nuxt.md`
- `packages/vue/src/controller/*`
- `packages/nuxt/src/runtime/composables/*`
