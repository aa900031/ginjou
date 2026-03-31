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

## Further Reading

- https://ginjou.pages.dev/guides/introduction
