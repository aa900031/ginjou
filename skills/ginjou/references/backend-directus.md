# Backend: Directus Reference

Use this reference when connecting Ginjou to a Directus backend.

## Concept

`@ginjou/with-directus` provides both a data fetcher and an auth adapter built on the Directus SDK. The fetcher maps Ginjou operations to Directus SDK calls. Use `meta.query` to pass Directus-specific query options.

## Installation

```bash
pnpm add @ginjou/with-directus @directus/sdk
```

## Setup

```typescript
import { authentication, createDirectus, rest } from '@directus/sdk'
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-directus'

const directus = createDirectus('https://your-directus.example.com')
	.with(rest())
	.with(authentication())

defineFetchersContext({ default: createFetcher({ client: directus }) })
defineAuthContext(createAuth({ client: directus }))
```

## `meta` Options

Pass these in the `meta` prop to control Directus queries:

```typescript
// Pass Directus query fields and filters
useGetList({
	resource: 'posts',
	meta: {
		query: {
			fields: ['id', 'title', 'status', 'user_created.name'],
			filter: { status: { _eq: 'published' } },
		},
	},
})

// Override only specific query fields
useGetOne({
	resource: 'posts',
	id: '1',
	meta: { query: { fields: ['*', 'tags.*'] } },
})

// Aggregation
useGetList({
	resource: 'posts',
	meta: {
		aggregate: { count: '*' },
		groupBy: ['status'],
	},
})
```

| `meta` field | Type | Purpose |
| --- | --- | --- |
| `query` | `Record<string, any>` | Directus query override (fields, filter, sort, etc.) |
| `aggregate` | `Record<string, any>` | Aggregation descriptor passed to Directus (for example `{ count: '*' }`) |
| `groupBy` | `string[]` | Group-by fields |

## Authentication Login Types

`createAuth` supports password and SSO login:

```typescript
import { useLogin } from '@ginjou/vue'

const { mutateAsync: login } = useLogin()

// Password
await login({
	type: 'password',
	params: { email: 'user@example.com', password: '…' },
})

// SSO
await login({
	type: 'sso',
	params: { provider: 'google' },
})
```

## Notes

- The Directus fetcher auto-pluralizes resource names to match Directus collection conventions.
- Protected system collections (e.g. `directus_users`) use dedicated Directus SDK functions automatically.
- Pagination uses Directus `page` and `limit` parameters. Total count uses `aggregate`.

## Further Reading

- https://ginjou.pages.dev/backend/directus
- https://docs.directus.io/reference/sdk
