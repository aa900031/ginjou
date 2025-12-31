---
title: RESTful API
description: Connect Ginjou to any RESTful API with json-server style conventions.
---

The `@ginjou/with-rest-api` package provides a flexible fetcher for connecting Ginjou to standard RESTful APIs. It is specifically designed to follow the conventions established by [json-server](https://github.com/typicode/json-server/tree/v0).

## Installation

Install the RESTful API provider and its peer dependency:

::code-group

```bash [pnpm]
pnpm add @ginjou/with-rest-api
```

```bash [yarn]
yarn add @ginjou/with-rest-api
```

```bash [npm]
npm install @ginjou/with-rest-api
```

```bash [bun]
bun add @ginjou/with-rest-api
```

::

## Setup

To use the RESTful API provider, initialize the fetcher and register it in your root component.

### Vue

In a Vue application, use `defineFetchersContext` within your `App.vue` setup.

```vue [App.vue]
<script setup lang="ts">
import { defineFetchersContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'

defineFetchersContext({
	default: createFetcher({
		url: 'https://api.example.com'
	})
})
</script>

<template>
	<RouterView />
</template>
```

### Nuxt

For Nuxt applications, register the provider in your root `app.vue` component.

```vue [app.vue]
<script setup lang="ts">
import { defineFetchersContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'

defineFetchersContext({
	default: createFetcher({
		url: 'https://api.example.com'
	})
})
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
```

## Fetcher Capability & Conventions

The `createFetcher` implementation relies on specific query parameters and header conventions common in the `json-server` ecosystem.

### Pagination

The fetcher translates Ginjou's pagination state into `_start` and `_end` query parameters.

- `_start`: The zero-based index of the first item to return.
- `_end`: The zero-based index of the last item (exclusive).

**Total Count**: The fetcher expects the total number of records to be returned in the `x-total-count` HTTP header. If this header is missing, it will default to the length of the returned data array.

### Sorting

Sorting is handled via `_sort` and `_order` parameters.

- `_sort`: A comma-separated list of fields to sort by.
- `_order`: A comma-separated list of sort directions (`asc` or `desc`).

### Filtering

Filters are mapped to query parameters using field suffixes:

| Operator | Parameter Suffix | Example |
| :--- | :--- | :--- |
| `eq` | (none) | `title=hello` |
| `ne` | `_ne` | `id_ne=1` |
| `gte` | `_gte` | `views_gte=10` |
| `lte` | `_lte` | `views_lte=20` |
| `contains` | `_like` | `title_like=ginjou` |

**Global Search**: If a filter with the field `q` is provided, it is sent as a global search parameter (`?q=keyword`) as per `json-server` specifications.

## Limitations

Because this provider follows the `json-server` specification, certain advanced filtering features are not supported:

- **Logical Operators**: The `or` and `and` logical operators are not supported. Using these in your filters will result in an error.
- **Nested Objects**: Filtering and sorting are primarily designed for flat resource structures.
