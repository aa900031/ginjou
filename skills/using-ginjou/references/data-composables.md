# Data Composables Reference

Use this reference when you need direct control over queries and mutations — for dialogs, widgets, bulk actions, custom endpoints, or any non-page CRUD flow.

## Concept

Data composables are the lower-level building blocks that controllers use internally. Choose them when:

- The component is not a standard CRUD page
- The record ID does not come from route resolution
- You need custom mutation timing, navigation, or cache behavior
- The task involves batch operations or custom API endpoints
- You are unsure whether the user wants full controller automation — ask first

## Query Composables

| Composable | Use for |
| --- | --- |
| `useGetList` | Fetch a list without page-state management |
| `useGetOne` | Fetch a single record by ID |
| `useGetMany` | Fetch multiple records by ID array |
| `useGetInfiniteList` | Infinite pagination without URL sync |
| `useCustom` | GET request to any non-resource endpoint |

```vue
<!-- From stories/vue/src/GetList.vue -->
<script setup lang="ts">
import type { Post } from './api/posts'
import { useGetList } from '@ginjou/vue'

const { records, isFetching } = useGetList<Post>({
  resource: 'posts',
  pagination: { current: 1, perPage: 10 },
  filters: [{ field: 'status', operator: 'eq', value: 'published' }],
  sorters: [{ field: 'createdAt', order: 'desc' }],
})
</script>
```

```vue
<!-- From stories/vue/src/GetOne.vue -->
<script setup lang="ts">
import type { Post } from './api/posts'
import { useGetOne } from '@ginjou/vue'

const { record, isFetching } = useGetOne<Post>({
  resource: 'posts',
  id: '6c6d3a48-8eef-4c96-a1ba-156bdfd3d389',
})
</script>
```

```typescript
// Custom GET endpoint
import { useCustom } from '@ginjou/vue'

const { record, isFetching } = useCustom({
  url: '/stats/summary',
  method: 'get',
  query: { period: '30d' },
})
```

## Mutation Composables

| Composable | Use for |
| --- | --- |
| `useCreateOne` | Create a single record |
| `useCreateMany` | Batch create |
| `useUpdateOne` | Update a single record |
| `useUpdateMany` | Batch update |
| `useDeleteOne` | Delete a single record |
| `useDeleteMany` | Batch delete |
| `useCustomMutation` | POST/PUT/DELETE to any non-resource endpoint |

```vue
<!-- From stories/vue/src/UpdateOne.vue -->
<script setup lang="ts">
import type { Post, PostFormData } from './api/posts'
import { useUpdateOne } from '@ginjou/vue'
import { reactive, shallowRef } from 'vue'

// Setup-time: resource and id are fixed
const { mutateAsync: updateOne, isPending } = useUpdateOne<Post, PostFormData>({
  resource: 'posts',
  id: '6c6d3a48-8eef-4c96-a1ba-156bdfd3d389',
})

const formData = reactive({ title: 'Next title' })
const result = shallowRef<Post>()

async function handleSubmit() {
  await updateOne({ params: formData as PostFormData }, {
    onSuccess: (data) => { result.value = data.data },
  })
}
</script>
```

```typescript
// Call-time: resource and id passed with each call (e.g. list-row actions)
const { mutateAsync: deleteOne } = useDeleteOne()
await deleteOne({ resource: 'posts', id: record.id, mutationMode: 'pessimistic' })
```

```typescript
// Custom mutation endpoint
import { useCustomMutation } from '@ginjou/vue'

const { mutateAsync: publish } = useCustomMutation()
await publish({ url: '/actions/publish', method: 'post', payload: { id: '1' } })
```

## Call-time vs Setup-time Args

All mutation composables accept `resource`, `id`, and params either at setup time (composable constructor) or at call time (`mutateAsync` argument). Call-time args override setup-time args.

- **Setup-time**: preferred when resource and id are fixed for this component instance
- **Call-time**: preferred for dynamic targets (list-row buttons, dialog-driven flows)

## Nuxt SSR Counterparts

For server-hydrated Nuxt pages, use:

| Vue | Nuxt SSR |
| --- | --- |
| `useGetList` | `useAsyncGetList` |
| `useGetOne` | `useAsyncGetOne` |
| `useGetMany` | `useAsyncGetMany` |
| `useGetInfiniteList` | `useAsyncGetInfiniteList` |

## Rules

- Use `useGetList` instead of `useList` when you only need data, not page-state management.
- Use `useGetOne` instead of `useShow` when the ID comes from props or another query.
- For bulk operations, use `*Many` variants instead of looping single mutations.
- Always confirm before calling `useDeleteOne` or `useDeleteMany`.
- Import `FilterOperator` from `@ginjou/core` for type-safe filter operators.

## Further Reading

- https://ginjou.pages.dev/guides/data
- https://ginjou.pages.dev/guides/list
