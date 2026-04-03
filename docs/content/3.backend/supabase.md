---
title: Supabase
description: Use Supabase as a fetcher and auth provider for Ginjou.
---

`@ginjou/with-supabase` connects Ginjou to Supabase PostgREST and Supabase Auth. It is a strong fit when your application wants SQL-backed data access plus a built-in authentication system.

## Mental Model

The Supabase package combines query translation with auth integration.

1. Resources map to PostgREST tables or views.
2. `meta` carries Supabase-specific query controls.
3. The auth provider exposes the supported Supabase sign-in methods.

Use it when your app wants Ginjou's generic data model on top of Supabase's query builder and auth flows.

## Installation

::code-group
---
sync: package-manager
---

```bash [pnpm]
pnpm add @ginjou/with-supabase @supabase/supabase-js
```

```bash [yarn]
yarn add @ginjou/with-supabase @supabase/supabase-js
```

```bash [npm]
npm install @ginjou/with-supabase @supabase/supabase-js
```

```bash [bun]
bun add @ginjou/with-supabase @supabase/supabase-js
```

::

## Setup

### Vue

::code-group

```vue [Vue]
<script setup lang="ts">
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-supabase'
import { createClient } from '@supabase/supabase-js'

const client = createClient('https://your-project.supabase.co', 'your-anon-key')

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
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-supabase'
import { createClient } from '@supabase/supabase-js'

const client = createClient('https://your-project.supabase.co', 'your-anon-key')

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

### Query Control

Use `meta` to pass Supabase-specific query details.

```ts
const { records } = useGetList({
	resource: 'posts',
	meta: {
		select: 'id, title, author(name)',
		count: 'exact',
	},
})
```

These values are mapped into the underlying Supabase query builder.

### Custom ID Column

If the table uses a primary key other than `id`, specify `idColumnName`.

```ts
const { record } = useGetOne({
	resource: 'posts',
	id: 'post-42',
	meta: {
		idColumnName: 'post_id',
	},
})
```

## Auth Support

The Supabase auth provider supports these login types:

- `password`
- `oauth`
- `idtoken`
- `otp`
- `sso`
- `otp-token`

```ts
await login({
	type: 'password',
	params: {
		email: 'user@example.com',
		password: 'password',
	},
})
```

```ts
await login({
	type: 'oauth',
	params: {
		provider: 'github',
		options: {
			redirectTo: 'https://your-app.com/callback',
		},
	},
})
```

```ts
await login({
	type: 'otp',
	params: {
		email: 'user@example.com',
		options: {
			redirectTo: 'https://your-app.com/callback',
		},
	},
})
```

The provider also exposes identity data through Supabase Auth, so `useGetIdentity` can return the current user when a session exists.

## When This Provider Fits

Use this provider when:

- your main data access goes through Supabase PostgREST
- you want built-in auth without adding a separate auth backend
- table and relation queries can still fit the Ginjou fetcher contract with `meta` extensions

Choose [Custom Fetcher](/backend/custom-fetcher) instead when the application relies on non-PostgREST endpoints as the normal path.
