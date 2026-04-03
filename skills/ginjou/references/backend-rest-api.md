# Backend: REST API Reference

Use this reference when connecting Ginjou to a generic REST API backend.

## Concept

`@ginjou/with-rest-api` provides a `createFetcher` that maps Ginjou operations to standard REST calls. It uses `ofetch` under the hood. There is no built-in auth adapter — you need to implement a custom auth provider.

## Installation

```bash
pnpm add @ginjou/with-rest-api
```

## Setup

```typescript
import { createFetcher } from '@ginjou/with-rest-api'
import { defineFetchersContext } from '@ginjou/vue'

defineFetchersContext({
  default: createFetcher({ url: 'https://api.example.com' }),
})
```

You can also provide a custom `ofetch` instance:

```typescript
import { createFetch } from 'ofetch'

const client = createFetch({
  defaults: { headers: { Authorization: `Bearer ${token}` } },
})
defineFetchersContext({
  default: createFetcher({ url: 'https://api.example.com', client }),
})
```

## URL and Method Conventions

The fetcher maps Ginjou operations as follows:

| Operation | HTTP | URL |
| --- | --- | --- |
| `getList` | GET | `/{resource}?_start=&_end=&_sort=&_order=` |
| `getOne` | GET | `/{resource}/{id}` |
| `createOne` | POST | `/{resource}` |
| `updateOne` | PUT | `/{resource}/{id}` |
| `deleteOne` | DELETE | `/{resource}/{id}` |
| `custom` | Configurable | Any URL |

## `meta` Options

Pass these in the `meta` prop of any composable to customize the request:

```typescript
// Override HTTP method
useGetOne({ resource: 'posts', id: '1', meta: { method: 'POST' } })

// Add custom headers
useCreateOne({ resource: 'posts', meta: { headers: { 'X-Custom': 'value' } } })
```

| `meta` field | Type | Purpose |
| --- | --- | --- |
| `method` | `string` | HTTP method override |
| `headers` | `Record<string, string>` | Extra request headers |

## Authentication

`@ginjou/with-rest-api` does not provide an auth adapter. Implement authentication using the Ginjou auth interface:

```typescript
import { defineAuth } from '@ginjou/core'
import { defineAuthContext } from '@ginjou/vue'

defineAuthContext(defineAuth({
  login: async ({ username, password }) => {
    const res = await fetch('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
    const { token } = await res.json()
    localStorage.setItem('token', token)
    return {}
  },
  logout: async () => {
    localStorage.removeItem('token')
    return {}
  },
  check: async () => {
    return { authenticated: !!localStorage.getItem('token') }
  },
  checkError: async (error) => {
    if ((error as any)?.status === 401) return { logout: true }
    return {}
  },
}))
```

## Further Reading

- https://ginjou.pages.dev/backend/rest-api
