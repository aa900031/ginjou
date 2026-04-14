# Controllers Reference

Use this reference for standard list pages, detail pages, create pages, edit pages, infinite scroll, and select inputs. Controllers are the high-level layer that handles common CRUD page patterns.

## Concept

Controllers wrap lower-level data composables and add page-level behaviors: pagination state, route syncing, record loading, form save flow, and navigation. Use a controller when the page follows a standard CRUD pattern. Drop to [data-composables.md](./data-composables.md) when the task needs custom orchestration.

For autocomplete and remote option loading (S07/S16), use the dedicated `useSelect` section in this file.

## `useList` — List Page

Manages pagination, filters, and sorters for a list page. `currentPage` and `perPage` are writable refs.

```vue
<script setup lang="ts">
import type { Post } from './types'
import { FilterOperator } from '@ginjou/core'
import { useList } from '@ginjou/vue'
import { reactive, unref, watch } from 'vue'

const {
	records,
	isFetching,
	currentPage,
	perPage,
	total,
	pageCount,
	filters,
	sorters,
} = useList<Post>({
	resource: 'posts',
	syncRoute: true, // syncs pagination/filters/sorters to URL query string
})

// Paginate by assigning to the ref
currentPage.value = 2

// Apply filters
const formData = reactive({ title: '', status: '' })
watch(() => unref(formData), (data) => {
	filters.value = [
		data.title ? { field: 'title', operator: FilterOperator.contains, value: data.title } : undefined,
		data.status ? { field: 'status', operator: FilterOperator.eq, value: data.status } : undefined,
	].filter(Boolean)
}, { flush: 'post', deep: true, immediate: true })
</script>
```

## `useInfiniteList` — Infinite Scroll / Load More

`records` is a nested array of pages, not a flat array. Use a nested `v-for`:

```vue
<script setup lang="ts">
import type { Post } from './types'
import { useInfiniteList } from '@ginjou/vue'

const { records, hasNextPage, fetchNextPage, perPage } = useInfiniteList<Post>({
	resource: 'posts',
	syncRoute: true,
})
</script>

<template>
	<!-- CORRECT: nested v-for for page groups -->
	<template v-for="(page, i) in records" :key="i">
		<tr v-for="item in page" :key="item.id">
			<td>{{ item.title }}</td>
		</tr>
	</template>
	<button :disabled="!hasNextPage" @click="fetchNextPage">
		More
	</button>
</template>
```

## `useShow` — Detail Page

Loads a single record. `resource` and `id` are optional **only** when Ginjou resource routing is active for this route. Otherwise, pass them explicitly.

```vue
<script setup lang="ts">
import type { Post } from './types'
import { useShow } from '@ginjou/vue'
import { toRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// Pass explicitly when resource routing is not configured
const { record, isFetching } = useShow<Post>({
	resource: 'posts',
	id: toRef(() => route.params.id as string),
})
</script>

<template>
	<div v-if="isFetching">
		Loading...
	</div>
	<div v-else-if="record">
		<p>{{ record.title }}</p>
		<p>{{ record.status }}</p>
	</div>
</template>
```

## `useCreate` — Create Page

Returns `save()` which accepts mutation data directly (no `params` wrapper). See [forms.md](./forms.md) for the full form pattern.

```vue
<script setup lang="ts">
import { useCreate } from '@ginjou/vue'

const { save, isPending } = useCreate({ resource: 'posts' })

async function handleSubmit(formData) {
	await save(formData)
}
</script>
```

## `useEdit` — Edit Page

Returns `record` (the fetched data) and `save()`. Like `useShow`, pass `resource` and `id` explicitly when resource routing is not configured. See [forms.md](./forms.md) for the form init pattern.

```vue
<script setup lang="ts">
import type { Post } from './types'
import { useEdit } from '@ginjou/vue'
import { toRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { record, save, isPending } = useEdit<Post>({
	resource: 'posts',
	id: toRef(() => route.params.id as string),
})
</script>
```

## `useSelect` — Select / Autocomplete Options

Loads remote options for a select or autocomplete input. Accepts a `value` ref to ensure the current selection is always visible even if it falls outside the current page of results.

`search` is a writable ref. Updating it triggers a refetch using the current backend's filtering behavior. If the UI needs debounce, add debounce at the input layer.

```vue
<script setup lang="ts">
import type { Post } from './types'
import { useSelect } from '@ginjou/vue'
import { ref } from 'vue'

const value = ref<string>()
const { options, search } = useSelect<Post>({
	resource: 'posts',
	value, // keeps current selection in the list
	labelKey: 'title', // default
	valueKey: 'id', // default
})

search.value = 'alice' // triggers remote filtering
</script>

<template>
	<input v-model="search" placeholder="Search…">
	<select v-model="value">
		<option v-for="opt in options" :key="opt.value" :value="opt.value">
			{{ opt.label }}
		</option>
	</select>
</template>
```

### Selected Value Persistence Pattern (S16)

When search results change, preserve the currently selected option separately from search text.

```vue
<script setup lang="ts">
import { useSelect } from '@ginjou/vue'
import { ref } from 'vue'

const selectedUserId = ref<string | undefined>()
const { options, search } = useSelect({
	resource: 'users',
	value: selectedUserId,
	labelKey: 'name',
	valueKey: 'id',
})

// User types; option list updates, but selectedUserId remains stable.
search.value = 'ali'
</script>
```

Use this pattern instead of modeling autocomplete as a list page controller.

### Option-Loading Decision Boundary (S07, S16)

- Use `useSelect` for remote option loading and search-driven autocomplete.
- Do not model autocomplete as a normal list page unless you truly need list-page behaviors.
- Keep selected value state independent from the transient search result set.

### Option-Loading Backend Checks

When using `useSelect` for remote autocomplete:

| Backend | Check |
| --- | --- |
| REST API | Confirm project search/filter contract and keep list pagination/sort mapping aligned with documented `getList` URL params (`_start`, `_end`, `_sort`, `_order`) |
| Supabase | Keep option-loading fields inside documented `meta.select`; add `meta.count` only when total pagination count is required |
| Directus | Keep option-loading fields and filtering inside documented `meta.query.fields` and `meta.query.filter` |

If backend filtering behavior is unclear, read the matching backend reference before modeling the UI state.

Before finalizing an autocomplete answer, include at least one backend check in the recommendation.

## Nuxt SSR Counterparts

| Vue | Nuxt SSR |
| --- | --- |
| `useList` | `useAsyncList` |
| `useInfiniteList` | `useAsyncInfiniteList` |
| `useShow` | `useAsyncShow` |
| `useEdit` | `useAsyncEdit` |
| `useSelect` | `useAsyncSelect` |

`useCreate` has no async variant.

## Rules

- Use controllers for clear standard CRUD pages. Use data composables for everything else.
- If the UI only needs remote option loading or autocomplete behavior, prefer `useSelect` over `useList` even if the component looks list-like.
- For S07/S16-style prompts, state the selected-value persistence rule explicitly.
- `useInfiniteList` returns page-grouped records — always use a nested `v-for`.
- `useShow` and `useEdit` auto-resolve `resource` and `id` only when the current route is registered as a Ginjou resource with the matching action. Otherwise pass them explicitly.
- `syncRoute: true` requires `defineRouterContext` in Vue.
- `FilterOperator` is imported from `@ginjou/core`.
- For `useSelect` option loading, verify backend-specific filtering constraints before finalizing search UX.

## Further Reading

- https://ginjou.pages.dev/guides/list
- https://ginjou.pages.dev/guides/form
