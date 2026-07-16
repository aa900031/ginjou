# Vue Resources

Use this reference for Vue resource registration and resource helper composables. See [Resources](https://ginjou.pages.dev/raw/guides/resources.md) for guide-level usage. See [behavior.md](./behavior.md) for definition shape, nested resources, and route-id compatibility.

## `defineControllerContext`

```ts
import { defineControllerContext } from '@ginjou/vue'

defineControllerContext({
	resources: [
		{ name: 'posts', list: '/posts', create: '/posts/new', show: '/posts/:id', edit: '/posts/:id/edit' },
	],
})
```

Add `meta.parent` for nested resources and `meta.fetcherName` for named fetcher binding.

## `useResource`

`useResource()` resolves a resource definition from an explicit name or the current route.

> ⚠️ **Warning:** `useResource` requires both `defineControllerContext` **and** `defineRouterContext` to be registered. Without router context, route inference will not work.

```ts
import { useResource } from '@ginjou/vue'

const inferred = useResource()
```

## `useResourcePath`

`useResourcePath()` builds one action path from the resolved resource definition.

```ts
import { ResourceAction } from '@ginjou/core'
import { useResourcePath } from '@ginjou/vue'

const resourcePath = useResourcePath({
	action: ResourceAction.Type.Create,
	resource: 'posts',
})

const editPath = useResourcePath({
	action: ResourceAction.Type.Edit,
	resource: 'posts',
	params: { id: 42 },
})
```

If the resource cannot be resolved, or the target action path does not exist, the result is `undefined`.

## Rules

- Register `defineControllerContext` once near app setup.
- Use `useResource()` when the current route should resolve to a resource definition and parsed route state.
- Use `useResourcePath()` when the UI needs one concrete path for a resource action.
- Keep nested-resource and multi-backend metadata inside the resource definition instead of scattering it across feature pages.
