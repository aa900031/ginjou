---
title: RESTful API
description: Use the RESTful API provider when your backend follows json-server style query conventions.
---

`@ginjou/with-rest-api` is the fastest way to connect Ginjou to a conventional REST API. It is designed around the request and response conventions popularized by `json-server`.

## Mental Model

This provider assumes the backend is already close to Ginjou's generic CRUD model.

1. Resources map to REST endpoints.
2. Pagination, sorting, and filtering become query parameters.
3. The provider translates Ginjou request shapes into common REST conventions.

Use it when your backend mostly needs parameter mapping, not business-specific request orchestration.

## Installation

::code-group
---
sync: package-manager
---

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

### Vue

::code-group

```vue [Vue]
<script setup lang="ts">
import { defineFetchersContext } from '@ginjou/vue'
import { createFetcher } from '@ginjou/with-rest-api'

defineFetchersContext({
	default: createFetcher({
		url: 'https://api.example.com',
	}),
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
import { createFetcher } from '@ginjou/with-rest-api'

defineFetchersContext({
	default: createFetcher({
		url: 'https://api.example.com',
	}),
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

This package only provides a fetcher. Authentication is intentionally left to the application because REST auth schemes vary too much between projects.

## Mapping

### Pagination

Pagination is mapped to `_start` and `_end` query parameters.

- `_start` is the zero-based offset
- `_end` is the exclusive upper bound

The provider reads the total count from the `x-total-count` response header. If the header is missing, it falls back to the returned array length.

### Sorting

Sorters map to `_sort` and `_order`.

- `_sort` is a comma-separated field list
- `_order` is a comma-separated direction list

### Filtering

Common operators are encoded as field suffixes.

| Operator | Query pattern |
| :--- | :--- |
| `eq` | `title=hello` |
| `ne` | `title_ne=hello` |
| `gte` | `views_gte=10` |
| `lte` | `views_lte=20` |
| `contains` | `title_like=ginjou` |

If the filter field is `q`, the provider sends a global search parameter.

## When This Provider Fits

Use this provider when your backend already looks like a simple resource-oriented REST API.

Choose [Custom Fetcher](/backend/custom-fetcher) instead when you need:

- different parameter names
- custom response envelopes
- cursor pagination
- complex auth headers or request signing
- backend-specific custom endpoints as the normal path, not the exception
