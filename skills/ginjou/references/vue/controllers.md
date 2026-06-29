# Vue Controllers

Use this reference for Vue read-side page controllers. See [List](https://ginjou.pages.dev/raw/guides/list.md) for list walkthroughs, [Forms](https://ginjou.pages.dev/raw/guides/form.md) for show/select page flows, and [core/controllers.md](../core/controllers.md) for controller-state rules.

## `useList`

`useList()` is the Vue list-page controller.

```vue
<script setup lang="ts">
import type { Post } from './types'
import { FilterOperator } from '@ginjou/core'
import { useList } from '@ginjou/vue'

const { records, setFilters, setSorters } = useList<Post>({
	resource: 'posts',
	syncRoute: true,
})

setFilters([{ field: 'title', operator: FilterOperator.contains, value: 'hello' }], 'replace')
setSorters([{ field: 'createdAt', order: 'desc' }])
</script>
```

`useList()` returns the underlying query result plus controller state.

| Return field | Meaning |
| --- | --- |
| `records` | Current page records |
| `currentPage` | Writable current page ref |
| `perPage` | Writable page-size ref |
| `filters` / `setFilters` | Reactive filter state and update function |
| `sorters` / `setSorters` | Reactive sorter state and update function |
| `total` | Total count from query data |
| `pageCount` | Derived page count |
| `isLoading` / `isPending` | Initial-load flag (drives the loading state) |
| `isError` / `error` | Error flag and error object (drive the error state) |
| `data` | Raw underlying vue-query result |

The loading/error fields spread from the underlying `@tanstack/vue-query`
result. Render the empty state from `records` being empty or `undefined`,
loading from `isLoading` / `isPending`, and errors from `isError` / `error`.
Pass initial `pagination` (`{ current, perPage }`), `sorters`, and `filters` via
the constructor options; change them at runtime with the setters above.

For non-page queries (widgets, dialogs), use `useGetList` from data composables instead of `useList`.

## `useInfiniteList`

`useInfiniteList()` keeps the same controller state as `useList()` and adds infinite-query helpers such as `fetchNextPage` and `hasNextPage`. `records` stays page-grouped.

Use `useInfiniteList()` for load-more or infinite-scroll UIs where each fetched page stays grouped and the UI advances with `fetchNextPage()`. Use `useList()` for traditional pagination with one current page plus `total` and `pageCount`; do not simulate infinite scroll by manually changing `useList().currentPage`.

```vue
<template>
	<template v-for="(page, i) in records" :key="i">
		<tr v-for="item in page" :key="item.id">
			<td>{{ item.title }}</td>
		</tr>
	</template>
</template>
```

## `useShow`

> ⚠️ **Warning:** `useShow()` is a **page controller** that automatically reads `id` from route params when `defineRouterContext()` is registered. You can also pass `id` manually. Do NOT use `useList()` with filters to fetch a single record.

`useShow()` loads one record for a detail page. Pass `resource` and `id` explicitly unless route/resource inference is already configured.

When `defineRouterContext()` and `defineControllerContext()` are registered, `useShow()` can infer the current resource and read `id` from the matched show-route params automatically.

```vue
<script setup lang="ts">
import type { Post } from './types'
import { useShow } from '@ginjou/vue'

const { record } = useShow<Post>({
	resource: 'posts',
	id: '1',
})
</script>
```

It returns `record`, writable `id`, and the underlying query state from `useGetOne()`.

Do not use `useList()` plus filters to fetch a single detail record. `useList()` is still a list controller and should stay on list pages.

## `useSelect`

`useSelect()` handles remote option loading and autocomplete-style search. It returns `options`, `search`, `currentPage`, and `perPage` on top of the list query state.

> ⚠️ **Warning:** Do not confuse `useSelect` (option-loading for dropdowns) with `useList` (full list page with pagination/filter/sort). For non-page data queries, use `useGetList` instead.

```vue
<script setup lang="ts">
import type { Post } from './types'
import { useSelect } from '@ginjou/vue'
import { ref } from 'vue'

const value = ref<string>()

const { options, search } = useSelect<Post>({
	resource: 'posts',
	value,
	labelKey: 'title',
	valueKey: 'id',
})
</script>
```

Keep the selected value ref separate from the search ref.

## Rules

- Use `useList` for standard list pages and `useInfiniteList` for load-more or infinite-scroll pages.
- Render `useInfiniteList().records` as page-grouped data, not as one flat array.
- Pass `resource` and `id` explicitly to `useShow` unless route-aware resource mapping is already configured.
- Use `useSelect` for remote option loading and autocomplete behavior.
- Keep selected value state separate from transient search text and option results.
