# Core REST API Backend

See [RESTful API](docs/content/3.backend/9.rest-api.md) for backend overview and json-server-style conventions.

## Concept

`@ginjou/with-rest-api` provides a `createFetcher` that maps Ginjou operations to standard REST calls and only provides the fetcher contract.

## Installation

```bash
pnpm add @ginjou/with-rest-api
```

## Setup

Create the REST fetcher with `createFetcher({ url })`, then register it in the active adapter's fetcher context during app initialization.

If the app needs shared headers, retry policy, or request interceptors, pass a custom `ofetch` client into `createFetcher({ url, client })`.

```typescript
import { createFetcher } from '@ginjou/with-rest-api'
import { createFetch } from 'ofetch'
const client = createFetch({
	defaults: { headers: { Authorization: `Bearer ${token}` } },
})
const fetcher = createFetcher({
	url: 'https://api.example.com',
	client,
})
```

## Support Matrix

| Support level | Methods |
| --- | --- |
| Implemented | `getList`, `getOne`, `createOne`, `updateOne`, `deleteOne`, `custom` |
| Not implemented | `getMany`, `createMany`, `updateMany`, `deleteMany` |

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

Standard resource methods build their final path from the fetcher base URL plus the resource name.

For `getList`, Ginjou pagination uses `pagination.current` for the page number and `pagination.perPage` for the page size. The REST API adapter converts those values into json-server-style `_start` and `_end` query params, so `current: 2, perPage: 5` becomes `_start=5` and `_end=10`.

Compared with the official `@ginjou/with-supabase` adapter, the pagination inputs stay the same (`current` plus `perPage`), but Supabase applies them through Postgrest `range(start, end)` calls instead of exposing `_start` and `_end` in the request URL.

`custom` uses the passed `url` directly instead of recombining it with the base URL, and it forwards `payload` as query parameters rather than as a request body.

## `meta` Options

For the standard resource methods, use `meta.method` and `meta.headers` to customize the request.

```typescript
{ resource: 'posts', id: '1', meta: { method: 'POST' } }
{ resource: 'posts', meta: { headers: { 'X-Custom': 'value' } } }
```

| `meta` field | Type | Purpose |
| --- | --- | --- |
| `method` | `string` | HTTP method override |
| `headers` | `Record<string, string>` | Extra request headers |

For `custom`, use the top-level `method` and `headers` props instead of `meta.method` and `meta.headers`.

```typescript
{
	url: '/actions/publish',
	method: 'post',
	headers: { 'X-Custom': 'value' },
	payload: { id: '1' },
}
```

Custom method normalization is literal:

> ⚠️ **Warning:** The REST API adapter remaps custom method values literally. Use the mapping table below as the actual runtime behavior: `post`, `put`, `patch` → PUT; `delete` → DELETE; all others → GET.

| Input method | Actual HTTP method |
| --- | --- |
| `post`, `put`, `patch` | `PUT` |
| `delete` | `DELETE` |
| `get`, others | `GET` |

That means `post`, `put`, and `patch` are all sent as `PUT` in the current implementation.

## Authentication

See [Authentication](docs/content/1.guides/4.authentication.md) for the auth contract.

Register auth separately through the active adapter's authentication context during app initialization. If the app also needs authz, realtime, notifications, or i18n, implement those through the matching Ginjou contexts separately.

## Rules

- Read this file whenever the answer depends on the generic REST fetcher contract, resource URL mapping, or request customization with `meta`.
- `@ginjou/with-rest-api` only implements the fetcher contract. Auth, authz, realtime, notifications, and i18n must be registered through separate Ginjou contexts.
- Standard resource methods build their final path from the fetcher base URL plus `/{resource}`. `custom` uses the passed `url` directly instead of recombining it with the base URL.
- For standard resource methods, customize requests with `meta.method` and `meta.headers`.
- For `custom`, use the top-level `method` and `headers`, and remember `payload` is forwarded as query parameters instead of a request body.
- Current custom method normalization is implementation-specific: `get` and unknown strings become `GET`, `delete` becomes `DELETE`, and `post`, `put`, and `patch` all become `PUT`.
- If the app needs authentication, implement the Ginjou auth interface separately instead of expecting this adapter to provide it.
