# Vue Resources

Use this reference for Vue resource registration and resource helper composables. See [Resources](https://ginjou.pages.dev/raw/guides/resources.md) for guide-level usage. See [core/resources.md](../core/resources.md) for definition shape, nested resources, and route-id compatibility.

## `defineResourceContext`

```ts
import { defineResourceContext } from '@ginjou/vue'

defineResourceContext({
	resources: [
		{ name: 'posts', list: '/posts', create: '/posts/new', show: '/posts/:id', edit: '/posts/:id/edit' },
	],
})
```

Add `meta.parent` for nested resources and `meta.fetcherName` for named fetcher binding.

## `useResource`

`useResource()` resolves a resource definition from an explicit name or the current route.

> ⚠️ **Warning:** `useResource` requires both `defineResourceContext` **and** `defineRouterContext` to be registered. Without router context, route inference will not work.

```ts
import { useResource } from '@ginjou/vue'

const inferred = useResource()
```

## `useResourcePath`

`useResourcePath()` builds one action path from the resolved resource definition.

```ts
import { ResourceActionType } from '@ginjou/core'
import { useResourcePath } from '@ginjou/vue'

const createPath = useResourcePath({
	action: ResourceActionType.Create,
	resource: 'posts',
})

const editPath = useResourcePath({
	action: ResourceActionType.Edit,
	resource: 'posts',
	params: { id: 42 },
})
```

If the resource cannot be resolved, or the target action path does not exist, the result is `undefined`.

## Rules

- Register `defineResourceContext` once near app setup.
- Use `useResource()` when the current route should resolve to a resource definition and parsed route state.
- Use `useResourcePath()` when the UI needs one concrete path for a resource action.
- Keep nested-resource and multi-backend metadata inside the resource definition instead of scattering it across feature pages.
