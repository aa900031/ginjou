---
title: RESTful API
description: Connect Ginjou to any RESTful API using json-server conventions.
---

The `@ginjou/with-rest-api` package connects Ginjou to standard RESTful APIs. It follows the query parameter and header conventions established by [json-server v0.x.x](https://github.com/typicode/json-server/tree/v0.17.4), making it compatible with many existing mocking tools and API standards.

## Installation

Install the provider.

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

Initialize the fetcher and register it in your root component (`App.vue` or `app.vue`).

::code-group
---
sync: guide-example
---

```vue [Vue]
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

```svelte [Svelte]
<!-- WIP -->
<script>
  // ...
</script>
```

::

## Fetcher Conventions

The `createFetcher` implementation relies on specific query parameters and headers to handle data operations.

### Pagination

The fetcher translates Ginjou's pagination state into `_start` and `_end` query parameters.

- `_start`: Zero-based index of the first item.
- `_end`: Zero-based index of the last item (exclusive).

::note
The API must return the total number of records in the `x-total-count` HTTP header. If missing, Ginjou defaults to the length of the returned array.
::

### Sorting

Sorting uses `_sort` and `_order` parameters.

- `_sort`: Comma-separated list of fields.
- `_order`: Comma-separated list of directions (`asc` or `desc`).

### Filtering

Filters map to query parameters using field suffixes.

| Operator | Parameter Suffix | Example |
| :--- | :--- | :--- |
| `eq` | (none) | `title=hello` |
| `ne` | `_ne` | `id_ne=1` |
| `gte` | `_gte` | `views_gte=10` |
| `lte` | `_lte` | `views_lte=20` |
| `contains` | `_like` | `title_like=ginjou` |

::tip
A filter with the field `q` sends a global search parameter (`?q=keyword`).
::

::warning
This provider does not support `or` / `and` logical operators or filtering on nested objects, as `json-server` does not natively support them.
::
