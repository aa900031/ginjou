---
title: Directus
description: Use Directus as both a Ginjou fetcher and an auth provider.
---

`@ginjou/with-directus` integrates Ginjou with the Directus SDK. It covers both data access and authentication, which makes it a good fit when Directus is the main backend for your admin application.

## Mental Model

The Directus package is a combined backend integration.

1. The fetcher maps resources to Directus collections.
2. `meta.query` passes Directus-specific query options.
3. The auth provider handles login and identity with the same Directus client.

Use it when Directus is the system of record instead of only one auxiliary service.

## Installation

::code-group
---
sync: package-manager
---

```bash [pnpm]
pnpm add @ginjou/with-directus @directus/sdk
```

```bash [yarn]
yarn add @ginjou/with-directus @directus/sdk
```

```bash [npm]
npm install @ginjou/with-directus @directus/sdk
```

```bash [bun]
bun add @ginjou/with-directus @directus/sdk
```

::

## Setup

### Vue

::code-group

```vue [Vue]
<script setup lang="ts">
import { authentication, createDirectus, rest } from '@directus/sdk'
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-directus'

const client = createDirectus('https://your-directus-url.com')
	.with(rest())
	.with(authentication())

defineFetchersContext({
	default: createFetcher({ client }),
})

defineAuthContext(createAuth({ client }))
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
import { authentication, createDirectus, rest } from '@directus/sdk'
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-directus'

const client = createDirectus('https://your-directus-url.com')
	.with(rest())
	.with(authentication())

defineFetchersContext({
	default: createFetcher({ client }),
})

defineAuthContext(createAuth({ client }))
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

## Mapping

### Resource Names

By default, the Ginjou resource name maps to the Directus collection name.

```ts
useGetList({ resource: 'posts' })
```

That resolves against the `posts` collection.

### System Collections

System collections are mapped when the resource name starts with `directus_` or `directus/`.

Examples:

- `directus_users` maps to the Directus users endpoint
- `directus_files` maps to the Directus files endpoint
- `directus_roles` maps to the Directus roles endpoint

### Advanced Queries

Use `meta.query` to pass Directus query options.

```ts
const { records } = useGetList({
	resource: 'posts',
	meta: {
		query: {
			fields: ['*', 'author.*'],
			sort: ['-date_created'],
		},
	},
})
```

That keeps the generic Ginjou API stable while still exposing Directus-specific power where needed.

## Auth Support

The Directus auth provider supports these login types:

- `password`
- `sso`

```ts
await login({
	type: 'password',
	params: {
		email: 'admin@example.com',
		password: 'password',
	},
})
```

```ts
await login({
	type: 'sso',
	params: {
		provider: 'google',
		options: {
			mode: 'session',
		},
	},
})
```

The provider also implements `getIdentity()` via Directus `readMe()`, so `useGetIdentity` works after login.

## When This Provider Fits

Use this provider when:

- Directus owns most of the application data
- you want one SDK client for data and auth
- collection-based CRUD is the dominant access pattern

Choose [Custom Fetcher](/backend/custom-fetcher) instead when the normal application flow depends more on custom endpoints than on Directus collection access.
