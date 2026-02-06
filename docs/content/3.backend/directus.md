---
title: Directus
description: Connect Directus to Ginjou for instant Headless CMS capabilities.
---

[Directus](https://directus.io/) is an instant Headless CMS that turns your SQL database into a flexible API. The `@ginjou/with-directus` package integrates Ginjou with Directus, providing seamless data management and authentication.

## Installation

Install the provider and the official Directus SDK.

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

Initialize the Directus client and register the providers in your root component (`App.vue` or `app.vue`).

::code-group
---
sync: guide-example
---

```vue [Vue]
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

```svelte [Svelte]
<!-- WIP -->
<script>
  // ...
</script>
```

::

## Fetcher

The `createFetcher` function maps Ginjou's data operations to Directus API requests.

### Resource Mapping

By default, the `resource` name corresponds to the Directus collection name.

```typescript
// Requests /items/posts
const { data } = useList({ resource: 'posts' })
```

### System Collections

The provider automatically routes requests for system collections. Resources prefixed with `directus_` or `directus/` map to their respective system endpoints:

- `directus_users` → `/users`
- `directus_files` → `/files`
- `directus_roles` → `/roles`

### Advanced Queries

Pass standard Directus query parameters via the `meta.query` object.

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

## Authentication

The `createAuth` function manages authentication state using the Directus SDK.

### Login Types

The provider supports password-based authentication and Single Sign-On (SSO).

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

### Identity

The `useIdentity` composable retrieves the current user's profile.

::note
Internally, this calls the Directus `/users/me` endpoint.
::

```typescript
const { data: user } = useIdentity()
```

### Session Management

The provider handles session verification and termination:

- `useAuth().check()`: Verifies the validity of the current token.
- `useAuth().logout()`: Terminates the session and revokes the token.
