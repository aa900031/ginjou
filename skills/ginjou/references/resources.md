# Resources Reference

Use this reference only when the task needs resource definitions, URL mapping, route-aware context, nested resources, or multiple fetchers.

## Resources Are Optional

Do not treat resources as mandatory application setup. Bring them in only when the application needs route-aware context resolution, route-derived IDs, navigation helpers, or fetcher binding at the resource level.

When the task does not depend on those behaviors, it is acceptable to work with lower-level composables or explicit arguments without introducing resources.

## Core Rule

When resources are used, they become the structural contract between browser routes, Ginjou context resolution, and fetcher selection. If resource patterns do not match real routes, route-aware behavior will be incorrect.

## Define Resources Early

Add `defineResourceContext` once the app needs any of the following:

- Route-based `useShow` or `useEdit`
- Navigation helpers that depend on resource actions
- Breadcrumbs or hierarchy
- Multiple backends bound per resource

## Standard Shape

Use the standard resource action keys:

- `list`
- `create`
- `edit`
- `show`
- `meta`

Map them directly to the real route patterns used by the app.

## Resource Rules

- Keep resource names stable and semantic, such as `posts` or `post-comments`.
- Match URL patterns exactly to the router configuration.
- Use `meta.parent` for nested resources.
- Use `meta.hide` for resolvable resources that should stay out of generated navigation.
- Use `meta.fetcherName` when a resource should use a non-default backend.
- Use `meta.deletable: true` to mark a resource as deletable. Ginjou uses this flag to determine whether to surface delete actions in generated navigation or breadcrumb components — it does not affect mutation behavior directly.

## Flat Resources

Use flat resources for standard CRUD screens:

```ts
const resources = [
	{
		name: 'posts',
		list: '/posts',
		create: '/posts/new',
		edit: '/posts/:id/edit',
		show: '/posts/:id',
	},
]
```

## Hierarchical Resources

Use `meta.parent` for nested route trees:

```ts
const resources = [
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
]
```

Use this pattern when the UI needs breadcrumbs, nested ownership, or route-derived parent context.

## Multiple Fetchers

For mixed backends, bind fetchers at the resource layer instead of branching inside components.

```ts
const resources = [
	{
		name: 'posts',
		list: '/posts',
		show: '/posts/:id',
		meta: {
			fetcherName: 'rest-api',
		},
	},
	{
		name: 'analytics',
		list: '/analytics',
		show: '/analytics/:id',
		meta: {
			fetcherName: 'graphql',
		},
	},
]
```

## When Not To Over-Customize

- Do not add custom parsing if standard route patterns already fit.
- Do not add resources just because the app uses Ginjou.
- Do not hardcode resource names in page components when route resolution is already available.
- Do not let router paths drift from resource patterns.

## Common Mistakes

- Defining resources after pages are already built around hardcoded assumptions.
- Using route paths that do not match the resource patterns.
- Forgetting `meta.fetcherName` in multi-backend apps.
- Using nested routes without `meta.parent` and then manually rebuilding hierarchy everywhere.

## Authority

- https://ginjou.pages.dev/guides/resources
