# Vue Data Composables

Use this reference for non-page reads and writes in Vue. See [Data](docs/content/1.guides/1.data.md) for workflow guidance. See [core/data-flow.md](../core/data-flow.md) for non-page boundaries, invalidation, and mutation-mode safety.

## Query Composables

| Composable | Use it for | Common result fields |
| --- | --- | --- |
| `useGetList` | List reads without page-controller state | `records`, `data`, `isFetching` |
| `useGetOne` | Single-record reads | `record`, `data`, `isFetching` |
| `useGetMany` | Multi-id reads | `records`, `data`, `isFetching` |
| `useGetInfiniteList` | Infinite reads without list-controller state | `records`, `fetchNextPage`, `hasNextPage` |
| `useCustom` | Non-resource GET flows | `record` or `data`, `isFetching` |

```vue
<script setup lang="ts">
import { useGetList } from '@ginjou/vue'

const { records } = useGetList({
	resource: 'posts',
	pagination: { current: 1, perPage: 10 },
})
</script>
```

> ⚠️ **Warning:** For non-page data queries (widgets, dialogs, dashboards), use `useGetList` — not `useSelect` (option-loading only) or `useList` (page controller).

All query composables forward `queryOptions`.

## Mutation Composables

| Composable | Use it for |
| --- | --- |
| `useCreateOne` | Create one record outside a page controller |
| `useUpdateOne` | Update one record outside a page controller |
| `useDeleteOne` | Delete one record outside a page controller |
| `useCustomMutation` | Non-CRUD write flows |

Batch variants such as `useCreateMany`, `useUpdateMany`, and `useDeleteMany` exist for bulk operations.

```ts
import { useDeleteOne } from '@ginjou/vue'

const { mutateAsync: deleteOne } = useDeleteOne()

await deleteOne({
	resource: 'posts',
	id: record.id,
	mutationMode: 'pessimistic',
})
```

> ⚠️ **Warning:** Use `useDeleteOne` for single-record delete (e.g., per-row delete button). Do **not** use `useDeleteMany` for single-record deletion — it is designed for batch operations with an `ids` array.

Standard CRUD mutation composables forward `mutationOptions`, support `invalidates`, and expose both `mutate` and `mutateAsync`.

## `useDeleteMany`

`useDeleteMany()` deletes multiple records in one mutation call. Pass `ids` as an array of record keys, typically `ids: string[] | number[]`.

```ts
import { useDeleteMany } from '@ginjou/vue'

const { mutateAsync: deleteMany } = useDeleteMany()

await deleteMany({
	resource: 'posts',
	ids: ['1', '2', '3'],
})
```

The official `@ginjou/with-supabase` adapter does not implement `deleteMany`, so use `useDeleteMany()` only with a backend adapter that exposes that fetcher method.

## `useCustom` And `useCustomMutation`

Use these when the endpoint does not fit the CRUD resource contract and the active backend supports custom endpoints.

> ⚠️ **Warning:** `useCustom` is for **read-only** custom queries (GET). For custom write operations (POST/PUT/DELETE), use `useCustomMutation` instead. Do not confuse them.

> ⚠️ **Warning:** `useCustomMutation` has **no** `mutationMode` and **no** built-in CRUD cache invalidation. If you need optimistic/undoable behavior or automatic cache refresh, handle it manually.

```ts
import { useCustomMutation } from '@ginjou/vue'

const { mutateAsync: publish } = useCustomMutation()

await publish({ url: '/actions/publish', method: 'post', payload: { id: '1' } })
```

Common call fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | `string` | Target endpoint |
| `method` | `string` | HTTP method passed to the adapter |
| `payload` | `object` | Request body or payload data for the custom mutation |

REST API and Directus support custom endpoints; the official Supabase adapter does not. `useCustomMutation()` does not add `mutationMode` or CRUD invalidation presets.

## Rules

- Use `useGetList`, `useGetOne`, `useGetMany`, and `useGetInfiniteList` for non-page reads.
- Use `useCreateOne`, `useUpdateOne`, and `useDeleteOne` for non-page CRUD mutations.
- Use `useCustom` and `useCustomMutation` only when the active backend adapter supports custom endpoints.
- Prefer batch composables over manual loops for bulk operations.
- Forward `queryOptions`, `mutationOptions`, and `invalidates` only when the UI needs that extra control.
- Do not describe `useCustomMutation` as if it supported `mutationMode` or CRUD invalidation presets.
