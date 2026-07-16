# Svelte Data Composables

Non-page reads and writes for Svelte 5. **The composable set and options match
Vue** — read [vue.md](./vue.md) for the full
table (which composable for what, batch variants, custom flows) and
[behavior.md](./behavior.md) for boundaries. This file pins only the
Svelte syntax. See [setup/svelte.md](../setup/svelte.md) for runes/accessor conventions.

## Reads — keep the object, pass an accessor for reactive args

```svelte
<script lang="ts">
import { useGetList } from '@ginjou/svelte'

const { category } = $props()
// Accessor form so the query re-runs when `category` changes:
const recent = useGetList(() => ({
  resource: 'posts',
  pagination: { current: 1, perPage: 5 },
  filters: category ? [{ field: 'category', operator: 'eq', value: category }] : [],
}))
</script>

{#if !recent.isFetching}
  {#each recent.records as post (post.id)}<li>{post.title}</li>{/each}
{/if}
```

Use `useGetList` for widgets/dialogs (not `useList`/`useSelect`). `useGetOne`,
`useGetMany`, `useGetInfiniteList` follow the same pattern.

## Mutations — destructure the method, read state off the object

The mutate functions (`mutate`/`mutateAsync`) are stable, so destructuring them
is fine. But read reactive state (`isPending`, `data`) off the kept object —
destructuring those would freeze them.

```svelte
<script lang="ts">
import { useDeleteOne } from '@ginjou/svelte'

const remove = useDeleteOne()

async function del(id: string | number) {
  await remove.mutateAsync({ resource: 'posts', id, mutationMode: 'pessimistic' })
}
</script>

<button disabled={remove.isPending} onclick={() => del(post.id)}>Delete</button>
```

`useCreateOne` / `useUpdateOne` / batch variants and `useCustom` /
`useCustomMutation` behave exactly as in Vue, including the backend-capability
caveats (Supabase has no `custom`/`deleteMany`).

## Rules

- Single delete → `useDeleteOne`; non-page read → `useGetList`. Same choices as Vue.
- Pass an accessor (`() => ({ … })`) whenever query args depend on reactive state.
- Read reactive fields (`isFetching`, `records`, `isPending`) off the returned object; destructure only the mutate methods.
