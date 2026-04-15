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

### Row Delete Modal Pattern (S06)

Use a dialog-confirm flow with call-time args for row actions.

```typescript
import { useDeleteOne } from '@ginjou/vue'

const { mutateAsync: deleteOne } = useDeleteOne()

async function confirmDelete(recordId: string) {
	// Called after user confirms in your custom modal
	await deleteOne({
		resource: 'posts',
		id: recordId,
		mutationMode: 'pessimistic',
	})
}
```

Prefer this over page-level controllers for row-level modal actions.

### Side-Panel Inline Edit Pattern (S17)

Use lower-level query plus mutation composables when editing in place without navigation.

```typescript
import { useGetOne, useUpdateOne } from '@ginjou/vue'

const { record } = useGetOne({ resource: 'posts', id: selectedId })
const { mutateAsync: updateOne } = useUpdateOne({ resource: 'posts', id: selectedId })

async function saveInline(params: { title: string }) {
	await updateOne({ params, mutationMode: 'pessimistic' })
}
```

Keep this flow non-page and avoid switching to `useEdit` unless route-level CRUD behavior is required.

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

## Backend Safety Checks For Non-Page Mutations

Before using `useDeleteOne`, `useUpdateOne`, or `useCustomMutation` in row actions, dialogs, or side panels:

| Backend | What to confirm before mutation |
| --- | --- |
| REST API | Endpoint exists for the action, HTTP method/headers are correct, and auth contract is configured in fetcher/auth setup |
| Supabase | Resource/id mapping and relevant meta fields are valid for the table; auth/session context is already registered at app root |
| Directus | Collection/query shape is valid and permission-sensitive fields are handled by current role/auth context |

This check is especially important for S06/S17-style flows where mutation happens outside page controllers.

## Mutation Mode Safety Gate

Before selecting mutation mode in non-page flows:

1. Confirm backend mutation reliability and error shape.
2. Default to `pessimistic` when backend behavior is uncertain.
3. Use `undoable` only when notification provider prerequisites are already satisfied.

Do not assume optimistic or undoable guarantees are identical across REST API, Supabase, and Directus adapters.

## Adapter Mutation Safety Matrix

Use this matrix before finalizing non-page mutation guidance:

| Backend | Validate before mutation | Safe default when uncertain |
| --- | --- | --- |
| REST API | Endpoint path, HTTP method, headers, and error response contract | `pessimistic` |
| Supabase | Table/id mapping (`idColumnName` when needed) and documented meta usage | `pessimistic` |
| Directus | Collection/query shape and permission-sensitive field behavior | `pessimistic` |

Use `undoable` only when notification prerequisites are met and backend mutation assumptions are clear.

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
- For non-page mutations, verify backend-specific safety checks before selecting mutation mode.
- For S06/S17-style prompts, include at least one concrete non-page mutation example in the recommendation.
- Import `FilterOperator` from `@ginjou/core` for type-safe filter operators.

## Further Reading

- https://ginjou.pages.dev/guides/data
- https://ginjou.pages.dev/guides/list
