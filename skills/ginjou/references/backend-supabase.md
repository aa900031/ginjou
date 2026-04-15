# Backend: Supabase Reference

Use this reference when connecting Ginjou to a Supabase backend.

## Concept

`@ginjou/with-supabase` provides both a data fetcher and an auth adapter. The fetcher maps Ginjou operations to the Supabase JavaScript client. It supports Postgrest `select` syntax through `meta`.

## Installation

```bash
pnpm add @ginjou/with-supabase @supabase/supabase-js
```

## Setup

```typescript
import { defineAuthContext, defineFetchersContext } from '@ginjou/vue'
import { createAuth, createFetcher } from '@ginjou/with-supabase'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project.supabase.co', 'your-anon-key')

defineFetchersContext({ default: createFetcher({ client: supabase }) })
defineAuthContext(createAuth({ client: supabase }))
```

## `meta` Options

Pass these in the `meta` prop to control Postgrest queries:

```typescript
// Select specific fields
useGetList({ resource: 'posts', meta: { select: 'id, title, status' } })

// With relations
useGetOne({ resource: 'posts', id: '1', meta: { select: '*, author:users(id, name)' } })

// Custom ID column
useGetOne({ resource: 'orders', id: 'order-001', meta: { idColumnName: 'order_id' } })

// Count type for pagination
useGetList({ resource: 'posts', meta: { count: 'exact' } })
```

| `meta` field | Type | Default | Purpose |
| --- | --- | --- | --- |
| `select` | `string` | `'*'` | Postgrest select expression |
| `count` | `'exact' \| 'planned' \| 'estimated'` | — | Count type for total pagination |
| `idColumnName` | `string` | `'id'` | Primary key column name |

## Authentication Login Types

`createAuth` supports all Supabase auth methods via a `type` discriminator:

```typescript
import { useLogin } from '@ginjou/vue'

const { mutateAsync: login } = useLogin()

// Password
await login({ type: 'password', params: { email: 'user@example.com', password: '…' } })

// OAuth (GitHub, Google, etc.)
await login({ type: 'oauth', params: { provider: 'github' } })

// OTP (magic link)
await login({ type: 'otp', params: { email: 'user@example.com' } })

// Verify OTP token
await login({ type: 'otp-token', params: { email: 'user@example.com', token: '…', type: 'email' } })

// ID Token (third-party OIDC)
await login({ type: 'idtoken', params: { provider: 'google', token: '…' } })

// SSO
await login({ type: 'sso', params: { domain: 'example.com' } })
```

## Further Reading

- https://ginjou.pages.dev/backend/supabase
- https://supabase.com/docs/reference/javascript
