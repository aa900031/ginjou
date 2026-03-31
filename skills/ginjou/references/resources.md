# Resources Reference

Use this reference only when the task needs resource definitions, URL mapping, route-aware context, nested resources, or multiple fetchers.

## Resources Are Optional

Do not treat resources as mandatory application setup. Bring them in only when the application needs:

- route-aware context resolution (e.g., `useShow()` or `useEdit()` resolving resource/id from the current route)
- navigation helpers that depend on resource actions
- breadcrumbs or hierarchy that track parent-child resource relationships
- per-resource fetcher binding for multi-backend apps

When none of the above applies, use lower-level composables with explicit `resource` and `id` arguments without introducing resources.

## Core Rule

When resources are used, they become the structural contract between browser routes, Ginjou context resolution, and fetcher selection. If resource patterns do not match real routes, route-aware behavior will silently produce wrong results.

## When to Register Resources

Add `defineResourceContext` once the app needs any of the following:

- Route-based auto-resolution for `useShow`, `useEdit`, or `useCreate`
- Navigation helpers that depend on resource actions
- Breadcrumbs or route hierarchy
- Multiple backends bound per resource via `meta.fetcherName`

## Standard Shape

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

### Resource Action Keys

- `list` — list page route
- `create` — create form route
- `edit` — edit form route
- `show` — detail view route
- `meta` — extra metadata (see below)

## Hierarchical Resources

Use `meta.parent` for nested route trees:

```typescript
defineResourceContext({
  resources: [
    {
      name: 'posts',
      list: '/posts',
      show: '/posts/:id',
    },
    {
      name: 'post-comments',
      list: '/posts/:postId/comments',
      show: '/posts/:postId/comments/:id',
      meta: {
        parent: 'posts',
      },
    },
  ],
})
```

Use this pattern when the UI needs breadcrumbs, nested ownership, or route-derived parent context.

## Multiple Fetchers

For mixed backends, bind fetchers at the resource layer:

```typescript
defineResourceContext({
  resources: [
    {
      name: 'posts',
      list: '/posts',
      show: '/posts/:id',
      meta: { fetcherName: 'rest-api' },
    },
    {
      name: 'analytics',
      list: '/analytics',
      show: '/analytics/:id',
      meta: { fetcherName: 'graphql' },
    },
  ],
})
```

Ensure the matching `fetcherName` keys are registered in `defineFetchersContext`.

## `meta` Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `parent` | `string` | Parent resource name — enables hierarchy/breadcrumbs |
| `fetcherName` | `string` | Which fetcher to use for this resource |
| `hide` | `boolean` | Exclude from generated navigation while keeping route resolution active |
| `deletable` | `boolean` | Signals that delete actions should surface in generated navigation/breadcrumbs; does not affect mutation behavior |

## Resource Rules

- Keep resource names stable and semantic: `posts`, `post-comments`, not ad-hoc strings.
- Match URL patterns exactly to the router configuration.
- Do not add resources just because the app uses Ginjou.
- Do not hardcode resource names in page components when route resolution is already available via resources.
- Do not let router paths drift from resource patterns.

## Common Mistakes

- Defining resources after pages are already built around hardcoded assumptions — add them early when they are needed.
- Using route paths that do not match the resource patterns, leading to broken auto-resolution.
- Forgetting `meta.fetcherName` in multi-backend apps.
- Adding nested routes without `meta.parent` and then manually rebuilding hierarchy everywhere.
- Expecting `useShow()` or `useEdit()` to auto-resolve resource/id without having registered matching resource entries.

## Authority

- https://ginjou.pages.dev/guides/resources
