# Svelte Controllers

Page controllers for Svelte 5. **Composable names, options, return fields, and
behavior match Vue** — read [vue/controllers.md](../vue/controllers.md) for the
API and [core/controllers.md](../core/controllers.md) for state/filter/sorter
rules. This file pins only the Svelte syntax. See [svelte/setup.md](./setup.md)
for the runes/accessor conventions all examples rely on.

## `useList` / `useInfiniteList`

Keep the returned controller as an object and read/assign its fields directly —
**don't destructure reactive fields** (that captures a non-reactive snapshot).

```svelte
<script lang="ts">
import { useList } from '@ginjou/svelte'

const list = useList<Post>({ resource: 'posts' })

function search(value: string) {
  list.filters = [{ field: 'title', operator: 'contains', value }] // assign directly
  list.currentPage = 1
}
</script>

{#each list.records as post (post.id)}
  <li>{post.title}</li>
{/each}
<button disabled={list.currentPage === 1} onclick={() => list.currentPage -= 1}>Prev</button>
```

`useInfiniteList` keeps the same state plus `fetchNextPage()` / `hasNextPage`;
render `list.records` page-grouped, exactly as in Vue.

## `useShow`

Pass `id` as an accessor when it comes from reactive props/route state.

```svelte
<script lang="ts">
import { useShow } from '@ginjou/svelte'

const { id } = $props()
const show = useShow<Post>(() => ({ resource: 'posts', id }))
</script>

{#if !show.isLoading && show.record}<h1>{show.record.title}</h1>{/if}
```

## `useSelect`

Same contract as Vue (`options`, `search`, …). Keep the selected value in your
own `$state` and read `select.options` off the returned object.

## Rules

- Read/assign controller fields off the returned object; don't destructure reactive state.
- Assign `currentPage` / `filters` / `sorters` directly instead of porting Vue setter idioms.
- Pass an accessor (`() => ({ … })`) when `id`/`resource`/options depend on reactive state.
- For everything else (filter operators, infinite vs paged, select vs list), the Vue and core references are authoritative.
