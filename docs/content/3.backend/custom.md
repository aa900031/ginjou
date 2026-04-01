---
title: Custom
description: Implement your own fetcher when the built-in providers do not match your backend.
---

The custom fetcher path is where Ginjou becomes framework-like instead of provider-like. If your API shape is unique, you do not need to bend the rest of the app around it. You only need to implement the fetcher contract that your screens rely on.

## Mental Model

A custom fetcher is a translation layer.

1. Components and controllers still speak in Ginjou request shapes.
2. The fetcher translates those shapes into backend-specific requests.
3. The rest of the app stays unchanged even if the backend is unusual.

This is the right abstraction boundary when the mismatch is in transport or payload structure, not in page behavior.

## When To Write One

Write a custom fetcher when:

- your backend uses non-standard query parameter names
- responses are wrapped in custom envelopes
- pagination is cursor-based
- standard CRUD is mixed with business-specific endpoints
- request signing or tenant headers are part of normal operation

If the built-in provider already matches the backend closely, use it instead. A custom fetcher should remove mismatch, not add another abstraction layer for no reason.

## Minimal Contract

You do not need to implement every method on day one. Start with the operations your app actually uses.

```ts
import { defineFetcher } from '@ginjou/core'

export const customFetcher = defineFetcher({
	async getList(props) {
		return {
			data: [],
			total: 0,
		}
	},
	async getOne(props) {
		return {
			data: {},
		}
	},
})
```

## Example Implementation

This example maps Ginjou requests to an API that uses `page` and `limit` instead of `_start` and `_end`.

```ts
import { defineFetcher } from '@ginjou/core'

export const customFetcher = defineFetcher({
	async getList({ resource, pagination, filters, sorters }) {
		const url = new URL(`https://api.example.com/${resource}`)

		if (pagination) {
			url.searchParams.set('page', String(pagination.current))
			url.searchParams.set('limit', String(pagination.perPage))
		}

		for (const filter of filters ?? []) {
			url.searchParams.set(`filter.${filter.field}.${filter.operator}`, String(filter.value))
		}

		for (const sorter of sorters ?? []) {
			url.searchParams.append('sort', `${sorter.field}:${sorter.order}`)
		}

		const response = await fetch(url)
		const json = await response.json()

		return {
			data: json.items,
			total: json.meta.total,
		}
	},

	async getOne({ resource, id }) {
		const response = await fetch(`https://api.example.com/${resource}/${id}`)
		const json = await response.json()

		return {
			data: json.item,
		}
	},

	async createOne({ resource, params }) {
		const response = await fetch(`https://api.example.com/${resource}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify(params),
		})
		const json = await response.json()

		return {
			data: json.item,
		}
	},

	async custom({ url, method = 'get', values }) {
		const response = await fetch(`https://api.example.com${url}`, {
			method: method.toUpperCase(),
			headers: {
				'content-type': 'application/json',
			},
			body: values == null ? undefined : JSON.stringify(values),
		})

		return {
			data: await response.json(),
		}
	},
})
```

## Setup

### Vue

::code-group

```vue [Vue]
<script setup lang="ts">
import { defineFetchersContext } from '@ginjou/vue'
import { customFetcher } from './fetchers/custom'

defineFetchersContext({
	default: customFetcher,
})
</script>

<template>
	<RouterView />
</template>
```

```svelte [Svelte]
<!-- WIP -->
```

::

### Nuxt

::code-group

```vue [Nuxt]
<script setup lang="ts">
import { defineFetchersContext } from '@ginjou/vue'
import { customFetcher } from '~/fetchers/custom'

defineFetchersContext({
	default: customFetcher,
})
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
```

```svelte [Svelte]
<!-- WIP -->
```

::

## Multiple Custom Fetchers

You can register more than one custom fetcher and select between them through resource metadata.

```ts
defineFetchersContext({
	default: customFetcher,
	analytics: analyticsFetcher,
})

defineResourceContext({
	resources: [
		{
			name: 'reports',
			list: '/reports',
			meta: {
				fetcherName: 'analytics',
			},
		},
	],
})
```

## Design Guidance

- Keep the fetcher focused on request and response translation.
- Do not move page logic into the fetcher.
- Use `meta` for backend-specific switches that only the fetcher understands.
- Add methods incrementally as the application surface grows.

That approach keeps the backend adaptation small and makes the rest of the Ginjou API stay consistent across projects.
