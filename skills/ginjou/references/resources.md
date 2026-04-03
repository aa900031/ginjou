# Resources Reference

Use this reference when registering resource definitions, mapping browser routes to Ginjou context, using nested resources, or binding different fetchers per resource.

## Concept

Resources are optional. They map resource names to route patterns and enable:

- Auto-resolution of `resource`, `id`, and `action` from the current URL in `useShow`, `useEdit`, etc.
- Navigation helpers that know how to go to `/posts/new` or `/posts/:id/edit`
- Breadcrumb and hierarchy support
- Per-resource fetcher binding for multi-backend apps

If none of these is needed, skip `defineResourceContext` and pass `resource` and `id` explicitly to each composable.

## Standard Setup

```typescript
import { defineResourceContext } from '@ginjou/vue'

defineResourceContext({
  resources: [
    {
      name: 'posts',
      list: '/posts',
      create: '/posts/new',
      edit: '/posts/:id/edit',
      show: '/posts/:id',
    },
  ],
})
```

With this in place, `useShow()` on the `/posts/:id` route auto-resolves `resource: 'posts'` and `id` from the URL parameter.

## Nested Resources

Use `meta.parent` for nested route hierarchies:

```typescript
defineResourceContext({
  resources: [
    { name: 'posts', list: '/posts', show: '/posts/:id' },
    {
      name: 'comments',
      list: '/posts/:postId/comments',
      show: '/posts/:postId/comments/:id',
      meta: { parent: 'posts' },
    },
  ],
})
```

## Multiple Fetchers

Bind different fetchers per resource using `meta.fetcherName`. The key must match a fetcher registered in `defineFetchersContext`.

```typescript
defineFetchersContext({
  'rest-api': createFetcher({ url: 'https://api.example.com' }),
  'supabase': createFetcher({ client: supabaseClient }),
})

defineResourceContext({
  resources: [
    { name: 'posts', list: '/posts', meta: { fetcherName: 'rest-api' } },
    { name: 'analytics', list: '/analytics', meta: { fetcherName: 'supabase' } },
  ],
})
```

`meta.fetcherName` only selects which fetcher handles the resource. It does not normalize backend-specific request options. Keep using the matching backend reference for each fetcher's `meta` shape:

- REST API: [backend-rest-api.md](./backend-rest-api.md)
- Supabase: [backend-supabase.md](./backend-supabase.md)
- Directus: [backend-directus.md](./backend-directus.md)

## Nested Routes + Multi-Backend (Worked Example)

Use this pattern for S18-style prompts where nested routes and multi-backend bindings must stay consistent.

```typescript
defineResourceContext({
  resources: [
    {
      name: 'accounts',
      list: '/accounts',
      show: '/accounts/:id',
      meta: { fetcherName: 'supabase' },
    },
    {
      name: 'orders',
      list: '/accounts/:accountId/orders',
      show: '/accounts/:accountId/orders/:id',
      meta: { parent: 'accounts', fetcherName: 'rest-api' },
    },
    {
      name: 'reports',
      list: '/reports',
      meta: { fetcherName: 'directus' },
    },
  ],
})
```

Boundary reminder:

- setup registers fetcher instances (`defineFetchersContext`)
- resources bind route metadata and `meta.fetcherName`
- backend references define adapter-specific `meta` query/auth rules

## Route ID Compatibility Checklist (S11)

When relying on route-driven `resource`/`id` inference for detail/edit flows, verify id compatibility with the active backend:

- REST API: route `:id` should map to the documented endpoint shape `/{resource}/{id}`.
- Supabase: if the primary key is not `id`, use documented `meta.idColumnName` where needed.
- Directus: route `:id` should match the collection id expectation used by your Directus resource.

If the route contract and backend id contract do not match, pass `resource` and `id` explicitly instead of relying on auto-inference.

## Resource `meta` Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `parent` | `string` | Parent resource name for hierarchy/breadcrumbs |
| `fetcherName` | `string` | Which fetcher to use for this resource |
| `hide` | `boolean` | Exclude from generated navigation while keeping route resolution |
| `deletable` | `boolean` | Signal that delete actions should surface in generated navigation |

## Rules

- Resources are optional — add them only when route-aware resolution or navigation is actually needed.
- Route patterns must exactly match the router configuration.
- Keep resource names stable and semantic: `posts`, `post-comments`, not ad-hoc strings.
- When resources are configured, `useShow`, `useEdit`, `useCreate` can omit `resource` and `id` — they are resolved from the URL.
- When resources are **not** configured, always pass `resource` and `id` explicitly.
- Multi-backend routing is a two-step setup: register named fetchers in `defineFetchersContext`, then bind them per resource with `meta.fetcherName`.

## Further Reading

- https://ginjou.pages.dev/guides/introduction
