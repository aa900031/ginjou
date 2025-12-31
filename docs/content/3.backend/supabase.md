---
title: Supabase
description: Complete integration for Database and AI.
---

[Supabase](https://supabase.com/) is an open-source Firebase alternative that provides a complete backend suite, including a Postgres database, authentication, instant APIs, and real-time subscriptions.

The `@ginjou/with-supabase` package provides the necessary providers to connect Ginjou with your Supabase project.

## Installation

Install the Supabase provider and the official Supabase SDK:

::code-group

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

To use Supabase with Ginjou, initialize the Supabase client and register the providers in your root component.

### Vue

In a Vue application, use `defineFetchersContext` and `defineAuthContext` within your `App.vue` setup.

```vue [App.vue]
<script setup lang="ts">
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const client = createClient(supabaseUrl, supabaseKey)

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
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'
const client = createClient(supabaseUrl, supabaseKey)

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

The `createFetcher` function integrates Ginjou's data hooks with Supabase's Postgrest API.

::tip
The `meta` object acts as a direct interface to Supabase's Postgrest syntax, enabling powerful joins and precise field control.
::

```typescript
const { data } = useList({
	resource: 'posts',
	meta: {
		// Maps directly to .select() in Supabase-js
		select: 'id, title, author(name)',
		count: 'exact',
	}
})
```

### Custom ID Column

If your table uses a column other than `id` as the primary key, specify it using `idColumnName`:

```typescript
const { data } = useOne({
	resource: 'posts',
	id: 'my-uuid',
	meta: {
		idColumnName: 'post_id'
	}
})
```

## Authentication

The `createAuth` function provides a wrapper around Supabase Auth (GoTrue).

### Login Types

The provider supports various Supabase authentication methods, including password, OAuth, and OTP.

```typescript
const { login } = useAuth()

// Password Authentication
await login({
	type: 'password',
	params: {
		email: 'user@example.com',
		password: 'password',
	},
})

// OAuth Authentication
await login({
	type: 'oauth',
	params: {
		provider: 'github',
	},
})

// OTP (Magic Link)
await login({
	type: 'otp',
	params: {
		email: 'user@example.com',
	},
})
```

::note
Internally, this uses `client.auth.getUser()` to safely retrieve the current user's profile and metadata from the server.
::

```typescript
const { data: user } = useIdentity()

console.log(user.email, user.user_metadata)
```

### Session Management

The Auth provider handles session lifecycle:

- `useAuth().check()`: Checks if an active session exists using `client.auth.getSession()`.
- `useAuth().logout()`: Terminates the current session.
