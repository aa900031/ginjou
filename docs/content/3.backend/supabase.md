---
title: Supabase
description: Connect Ginjou to your Supabase project for database and authentication features.
---

[Supabase](https://supabase.com/) is an open-source Firebase alternative offering a complete backend suite. The `@ginjou/with-supabase` package connects Ginjou to your Supabase project, enabling instant access to your Postgres database and authentication services.

## Installation

Install the provider and the official Supabase SDK.

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

Initialize the Supabase client and register the providers in your root component (`App.vue` or `app.vue`).

::code-group
---
sync: guide-example
---

```vue [Vue]
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

```svelte [Svelte]
<!-- WIP -->
<script>
  // ...
</script>
```

::

## Fetcher

The `createFetcher` function integrates Ginjou's data hooks with Supabase's Postgrest API.

### Query Control

Use the `meta` object to control the Supabase query directly. This maps to the `.select()` method in the SDK.

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

If your table uses a primary key other than `id`, specify it using `idColumnName`.

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

The `createAuth` function wraps Supabase Auth (GoTrue) to manage user sessions.

### Login Types

The provider supports multiple authentication methods. The `type` determines which Supabase-js method is called.

- `password`: Calls `signInWithPassword`
- `oauth`: Calls `signInWithOAuth`
- `otp`: Calls `signInWithOtp` (Magic Link or SMS)
- `otp-token`: Calls `verifyOtp` (Verify code)
- `idtoken`: Calls `signInWithIdToken`
- `sso`: Calls `signInWithSSO`

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
		options: {
			redirectTo: 'https://your-app.com/callback',
		},
	},
})

// OTP (Magic Link)
await login({
	type: 'otp',
	params: {
		email: 'user@example.com',
		options: {
			redirectTo: 'https://your-app.com/callback',
		},
	},
})

// OTP Token Verification
await login({
	type: 'otp-token',
	params: {
		email: 'user@example.com',
		token: '123456',
		type: 'magiclink',
	},
})
```
