# Supabase Backend (core)

## Concept

See [Supabase](https://ginjou.pages.dev/raw/backend/supabase.md) for adapter overview and supported flows.

`@ginjou/with-supabase` provides a data fetcher plus auth, supports Postgrest `select` syntax through `meta`, and does not implement `custom`.

## Installation

```bash
pnpm add @ginjou/with-supabase @supabase/supabase-js
```

## Setup

```typescript
import { createAuth, createFetcher } from '@ginjou/with-supabase'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project.supabase.co', 'your-anon-key')
const fetcher = createFetcher({ client: supabase })
const auth = createAuth({ client: supabase })
```
Register `fetcher` in the active adapter's fetcher context and `auth` in the matching authentication context during app initialization.

## Support Matrix

> ⚠️ **Warning:** `@ginjou/with-supabase` does **not** support `custom`, `updateMany`, or `deleteMany`. Only use the methods listed as "Implemented" below.

| Support level | Methods |
| --- | --- |
| Implemented | `getList`, `getMany`, `getOne`, `createOne`, `createMany`, `updateOne`, `deleteOne` |
| Not implemented | `custom`, `updateMany`, `deleteMany` |

These limitations are specific to the official `@ginjou/with-supabase` adapter.

## `meta` Options

```
{ resource: 'posts', meta: { select: 'id, title, status' } }
{ resource: 'posts', id: '1', meta: { select: '*, author:users(id, name)' } }
{ resource: 'orders', id: 'order-001', meta: { idColumnName: 'order_id' } }
```

| `meta` field | Type | Default | Purpose |
| --- | --- | --- | --- |
| `select` | `string` | `'*'` | Postgrest select expression |
| `count` | `'exact' \| 'planned' \| 'estimated'` | `'exact'` | Count type for total pagination |
| `idColumnName` | `string` | `'id'` | Primary key column name |

## Authentication Login Types

`createAuth` supports all Supabase auth methods via a `type` discriminator. Pass one of these payloads to the active adapter's login invocation:

> ⚠️ **Warning:** `@ginjou/with-supabase`'s `createAuth` is a **framework-agnostic** adapter. It works at the core level and does not depend on Vue or Nuxt.

```
{ type: 'password', params: { email: 'user@example.com', password: '…' } }
{ type: 'oauth', params: { provider: 'github' } }
{ type: 'otp', params: { email: 'user@example.com' } }
{ type: 'otp-token', params: { email: 'user@example.com', token: '…', type: 'email' } }
{ type: 'idtoken', params: { provider: 'google', token: '…' } }
{ type: 'sso', params: { domain: 'example.com' } }
```

## Rules

- Read this file whenever the answer depends on Supabase fetcher/auth setup, supported CRUD coverage, or Postgrest-specific `meta` options.
- `@ginjou/with-supabase` provides both a fetcher adapter and an auth adapter; register `createFetcher` and `createAuth` through the matching Ginjou contexts.
- Supported fetcher methods are `getList`, `getMany`, `getOne`, `createOne`, `createMany`, `updateOne`, and `deleteOne`; do not assume `custom`, `updateMany`, or `deleteMany` exist.
- Use `meta.select`, `meta.count`, and `meta.idColumnName` to control Postgrest behavior; their defaults are `'*'`, `'exact'`, and `'id'`.
- `custom` is not implemented in the official `@ginjou/with-supabase` adapter; do not describe Supabase RPC or arbitrary custom request flows as supported through this adapter.
- Auth login uses a `type` discriminator. Keep guidance aligned with the supported password, oauth, otp, otp-token, idtoken, and sso flows.
