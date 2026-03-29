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

- `useGetList`
- `useGetInfiniteList`
- `useGetOne`
- `useGetMany`

In Nuxt, use the SSR-aware counterparts when the initial render should be server hydrated:

- `useAsyncGetList`
- `useAsyncGetOne`
- `useAsyncGetMany`

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

// Mutations — resource/id/params passed at CALL TIME to mutateAsync, not at setup
const { mutateAsync: create } = useCreateOne()
const { mutateAsync: update } = useUpdateOne()
const { mutateAsync: deleteOne } = useDeleteOne()

await create({ resource: 'posts', params: { title: 'Hello' } })
await update({ resource: 'posts', id: '1', params: { title: 'Updated' } })
await deleteOne({ resource: 'posts', id: '1' })

// Filter operator string literals (from @ginjou/core)
// 'eq' | 'ne' | 'lt' | 'gt' | 'lte' | 'gte' | 'in' | 'nin' | 'contains' | 'ncontains' (partial list — import FilterOperator from '@ginjou/core' for full set)
```

## Mutation Composables

Use these when you need direct control over mutation flows:

- `useCreateOne`
- `useCreateMany`
- `useUpdateOne`
- `useUpdateMany`
- `useDeleteOne`
- `useDeleteMany`

These are the right tools for bulk operations, custom mutation pipelines, non-page interactions, and advanced orchestration.

## Selection Guidance

- Choose `useGetList` instead of `useList` when you only need fetched data, not page state management.
- Choose `useGetOne` instead of `useShow` when the ID comes from props, local state, or another query.
- Choose `useUpdateMany` or `useDeleteMany` for batch actions instead of looping manual one-by-one mutations.
- Choose `useCreateOne` or `useUpdateOne` when navigation after success must be handled by app-specific logic.

## Composition Rules

- Compose with resource definitions instead of hardcoding fetcher differences in components.
- Let each composable keep a single responsibility.
- Add your own orchestration around composables rather than rewriting the underlying fetcher contract.

## Common Mistakes

- Forgetting to ask the user before choosing controllers when the workflow is not obviously standard CRUD.
- Replacing a controller with multiple low-level composables when the page is still standard CRUD.
- Looping `useUpdateOne` or `useDeleteOne` for bulk actions instead of using the many variants.
- Mixing route resolution, form state, and raw query logic in one large component.
- Forgetting Nuxt async counterparts on SSR-first pages.
- When calling `useDeleteOne` in a page context, always pair it with an explicit confirmation step first — see `references/forms.md` for the confirmation-before-delete pattern.

## Authority

- https://ginjou.pages.dev/guides/introduction
- https://ginjou.pages.dev/guides/data
- https://ginjou.pages.dev/guides/list
- https://ginjou.pages.dev/guides/form
