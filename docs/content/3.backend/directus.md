---
title: Directus
description: Connect Directus to Ginjou for instant Headless CMS capabilities.
---

[Directus](https://directus.io/) is an instant Headless CMS that provides a flexible REST and GraphQL API for your SQL database.

The `@ginjou/with-directus` package provides the necessary providers to integrate Ginjou with a Directus backend, enabling seamless data management and authentication.

## Installation

Install the Directus provider along with the official Directus SDK:

::code-group

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

To use the providers in your application, register them using the configuration hooks in your root component.

### Vue

In a Vue application, use `defineFetchersContext` and `defineAuthContext` within your `App.vue` setup.

```vue [App.vue]
<script setup lang="ts">
import { authentication, createDirectus, rest } from '@directus/sdk'
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-directus'

const client = createDirectus('https://your-directus-url.com')
	.with(rest())
	.with(authentication())

defineFetchersContext({
	default: createFetcher({ client })
})

defineAuthContext(createAuth({ client }))
</script>

<template>
	<RouterView />
</template>
```

### Nuxt

For Nuxt applications, register the providers in your root `app.vue` component.

```vue [app.vue]
<script setup lang="ts">
import { authentication, createDirectus, rest } from '@directus/sdk'
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-directus'

const client = createDirectus('https://your-directus-url.com')
	.with(rest())
	.with(authentication())

defineFetchersContext({
	default: createFetcher({ client })
})

defineAuthContext(createAuth({ client }))
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>
```

## Fetcher

The `createFetcher` function maps Ginjou data hooks to Directus API requests.

### Resource Mapping

By default, the `resource` name maps to the corresponding Directus collection.

```typescript
// Requests /items/posts
const { data } = useList({ resource: 'posts' })
```

### Advanced Queries

::tip
The `meta.query` object is passed directly to the `@directus/sdk` rest methods, allowing you to use any standard Directus query parameters.
::

```typescript
const { data } = useList({
	resource: 'posts',
	meta: {
		query: {
			fields: ['*', 'author.*'],
			sort: ['-date_created'],
		}
	}
})
```

### System Collections

::note
The provider automatically routes requests for system collections. Resources prefixed with `directus_` or `directus/` are mapped to their respective system endpoints:
::

- `directus_users` maps to `/users`
- `directus_files` maps to `/files`
- `directus_roles` maps to `/roles`

## Authentication

The `createAuth` function facilitates integration with Directus authentication services.

### Login Types

The provider supports both standard password-based authentication and Single Sign-On (SSO).

```typescript
const { login } = useAuth()

// Password Authentication
await login({
	type: 'password',
	params: {
		email: 'admin@example.com',
		password: 'password',
	},
})

// SSO Authentication
await login({
	type: 'sso',
	params: {
		provider: 'google',
		options: {
			redirect: 'https://your-app.com/callback',
		},
	},
})
```

::note
This internally calls the Directus `/users/me` endpoint to fetch the full user profile.
::

```typescript
const { data: user } = useIdentity()
```

### Session Management

The Auth provider handles session verification and termination:

- `useAuth().check()`: Verifies the existence of a valid authentication token.
- `useAuth().logout()`: Terminates the current session and revokes the token.
