# Core Directus Backend

## Concept

See [Directus](docs/content/3.backend/0.directus.md) for adapter overview and Directus-specific setup.

`@ginjou/with-directus` provides a data fetcher plus auth, implements `custom`, uses `meta.query` for Directus-specific query options, and uses `meta.aggregate` only to override the `getList()` total-count aggregate. The runtime default is `{ countDistinct: 'id' }`.

## Installation

```bash
pnpm add @ginjou/with-directus @directus/sdk
```

## Setup

```typescript
import { authentication, createDirectus, rest } from '@directus/sdk'
import { createAuth, createFetcher } from '@ginjou/with-directus'

const directus = createDirectus('https://your-directus.example.com')
	.with(rest())
	.with(authentication())
const fetcher = createFetcher({ client: directus })
const auth = createAuth({ client: directus })
```
Register `fetcher` in the active adapter's fetcher context and `auth` in the matching authentication context during app initialization.

## `meta` Options

```
{
	resource: 'posts',
	meta: {
		query: {
			fields: ['id', 'title', 'status', 'user_created.name'],
			filter: { status: { _eq: 'published' } },
		},
	},
}
{ resource: 'posts', id: '1', meta: { query: { fields: ['*', 'tags.*'] } } }
{ resource: 'posts', meta: { aggregate: { countDistinct: 'id' } } }
```

> ⚠️ **Warning:** `groupBy` exists in the type definition but the adapter implementation does **not** use it.

| `meta` field | Type | Purpose |
| --- | --- | --- |
| `query` | `Record<string, any>` | Directus query override (fields, filter, sort, etc.) |
| `aggregate` | `string[]` in the source interface, but object-shaped at runtime | Override the aggregate descriptor used for `getList()` total count |

`meta.aggregate` currently has a type mismatch in the source: the interface declares `string[]`, but the fetcher runtime passes an object to the Directus SDK and defaults to `{ countDistinct: 'id' }`. Follow the runtime behavior when configuring it.

> ⚠️ **Warning:** `getList()` total reads **only** the `countDistinct` branch. Passing other aggregate shapes such as `count` or `sum` does **not** change how `total` is calculated.

`getList()` excludes `status: archived` by default. Override that through `meta.query.filter.status` when archived records must be visible.

## Authentication Login Types

`createAuth` supports password and SSO login.

```
{ type: 'password', params: { email: 'user@example.com', password: '…' } }
{ type: 'sso', params: { provider: 'google' } }
```

## Notes

- Normal collections use the generic Directus item helpers.
- System collections whose resource starts with `directus_` or `directus/` use the matching dedicated Directus SDK helpers automatically.

## Rules

- Read this file whenever the answer depends on Directus SDK setup, Directus auth login types, or Directus-specific `meta.query` / `meta.aggregate` behavior.
- `@ginjou/with-directus` provides both a fetcher adapter and an auth adapter; register `createFetcher` and `createAuth` through the active adapter contexts during app initialization.
- The adapter implements `custom`; use the active adapter's custom request pattern for Directus-specific request flows.
- Use `meta.query` for Directus query overrides. Use `meta.aggregate` only to override `getList()` total-count aggregation. The runtime default is `{ countDistinct: 'id' }`, and `total` currently reads only `countDistinct`.
- The source interface declares `meta.aggregate` as `string[]`, but the runtime passes an object-shaped aggregate descriptor to the Directus SDK. Prefer the runtime behavior when answering usage questions.
- `getList()` excludes archived records by default. Override `meta.query.filter.status` when archived items must be visible.
- `groupBy` exists in the type definition but the adapter implementation does **not** use it. Do not recommend `groupBy` as a usable feature.
- Resources starting with `directus_` or `directus/` use the dedicated Directus system-collection helpers automatically.
