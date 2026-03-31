# Data Composables Reference

Use this reference when the task needs finer-grained control than the page-level controllers provide.

## When To Choose Data Composables

Drop to lower-level composables when one of these is true:

- the component is not a standard CRUD page
- the record ID does not come from normal route resolution
- the page needs custom query composition or batch operations
- mutation timing, navigation, or cache handling must be orchestrated manually
- the app is progressively adopting Ginjou inside an existing screen
- it is not clear that the user wants controller-style CRUD automation

## Query Composables

Use these to fetch data directly:

- `useGetList` — list of records with pagination, filters, and sorters
- `useGetInfiniteList` — infinite/paginated list with `fetchNextPage`
- `useGetOne` — single record by id
- `useGetMany` — multiple records by id array
- `useCustom` — arbitrary GET-style call to any URL outside the standard resource contract

In Nuxt, use the SSR-aware counterparts when the initial render should be server hydrated:

- `useAsyncGetList`
- `useAsyncGetInfiniteList`
- `useAsyncGetOne`
- `useAsyncGetMany`

## Mutation Composables

Use these when you need direct control over mutation flows:

- `useCreateOne`
- `useCreateMany`
- `useUpdateOne`
- `useUpdateMany`
- `useDeleteOne`
- `useDeleteMany`
- `useCustomMutation` — arbitrary mutation to any URL outside the standard resource contract

## Key Shapes

```typescript
// Queries — resource and options set at composable creation
const { records, isFetching, data } = useGetList({
  resource: 'posts',
  pagination: { current: 1, perPage: 10 },
  filters: [{ field: 'status', operator: 'eq', value: 'published' }],
  sorters: [{ field: 'createdAt', order: 'desc' }],
})
const { record, isFetching } = useGetOne({ resource: 'posts', id: '1' })
const { records } = useGetMany({ resource: 'posts', ids: ['1', '2', '3'] })

// Mutations — resource/id/params can be passed at SETUP TIME (composable props)
// OR at CALL TIME (mutateAsync args). Call-time args override setup-time args.

// Pattern A: resource and id at SETUP TIME, only params at call time
const { mutateAsync: updateOne } = useUpdateOne({
  resource: 'posts',
  id: '6c6d3a48-8eef-4c96-a1ba-156bdfd3d389',
})
await updateOne({ params: { title: 'Updated' } })

// Pattern B: all args at CALL TIME (better for list-row actions or dynamic targets)
const { mutateAsync: deleteOne } = useDeleteOne()
await deleteOne({ resource: 'posts', id: record.id, mutationMode: 'pessimistic' })

// Pattern C: basic create at call time
const { mutateAsync: create } = useCreateOne()
await create({ resource: 'posts', params: { title: 'Hello' } })

// useCustom — arbitrary GET-style fetcher call (not tied to a resource)
const { record, isFetching } = useCustom({
  url: '/stats/summary',
  method: 'get',
  query: { period: '30d' },
  // fetcherName defaults to 'default'
})

// useCustomMutation — arbitrary mutation (POST/PUT/DELETE) to a custom endpoint
const { mutateAsync: callApi } = useCustomMutation()
await callApi({ url: '/actions/publish', method: 'post', payload: { id: '1' } })
```

## Mutation Parameter Rules

All mutation composables (`useCreateOne`, `useUpdateOne`, `useDeleteOne`, etc.) accept `resource`, `id`, and operation-specific fields **either as setup-time props** (passed to the composable constructor) **or as call-time args** (passed to `mutateAsync`). Call-time args take precedence when both are present.

- Use **setup-time** props when the resource and id are fixed for this component instance.
- Use **call-time** args when the target record varies (e.g., list-row delete buttons, dynamic dialogs).

## Selection Guidance

- Choose `useGetList` instead of `useList` when you only need fetched data, not page state management.
- Choose `useGetOne` instead of `useShow` when the ID comes from props, local state, or another query.
- Choose `useUpdateMany` or `useDeleteMany` for batch actions instead of looping one-by-one mutations.
- Choose `useCreateOne` or `useUpdateOne` when navigation after success must be handled by custom logic.
- Choose `useCustom` when you need to query a non-standard endpoint that does not map to a Ginjou resource.
- Choose `useCustomMutation` when you need to call a non-standard endpoint as a mutation.

## Filter Operators

Import `FilterOperator` from `@ginjou/core` for type-safe filter operator constants:

```typescript
import { FilterOperator } from '@ginjou/core'

filters.value = [
  { field: 'title', operator: FilterOperator.contains, value: searchTerm },
  { field: 'status', operator: FilterOperator.eq, value: 'published' },
]
```

## Composition Rules

- Compose with resource definitions instead of hardcoding fetcher differences in components.
- Let each composable keep a single responsibility.
- Add your own orchestration around composables rather than rewriting the underlying fetcher contract.
- Always pair `useDeleteOne` with an explicit confirmation step before calling `mutateAsync`.

## Common Mistakes

- Forgetting to ask the user before choosing controllers when the workflow is not obviously standard CRUD.
- Replacing a controller with multiple low-level composables when the page is still standard CRUD.
- Looping `useUpdateOne` or `useDeleteOne` for bulk actions instead of using the `*Many` variants.
- Mixing route resolution, form state, and raw query logic in one large component.
- Forgetting Nuxt async counterparts on SSR-first pages.
- Triggering delete without a confirmation flow.

## Authority

- https://ginjou.pages.dev/guides/introduction
- https://ginjou.pages.dev/guides/data
- https://ginjou.pages.dev/guides/list
- https://ginjou.pages.dev/guides/form
