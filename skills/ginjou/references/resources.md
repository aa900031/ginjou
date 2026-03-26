# Resources Reference

Use this reference when the task needs resource definitions, URL mapping, route-aware context, nested resources, or multiple fetchers.

## Core Rule

Resource definitions are the structural contract between browser routes, Ginjou context resolution, and fetcher selection. If resource patterns do not match real routes, controllers that rely on route context will behave incorrectly.

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
- Use `meta.deletable` only when the app wants delete behavior surfaced as resource metadata.

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
- Do not hardcode resource names in page components when route resolution is already available.
- Do not let router paths drift from resource patterns.

## Common Mistakes

- Defining resources after pages are already built around hardcoded assumptions.
- Using route paths that do not match the resource patterns.
- Forgetting `meta.fetcherName` in multi-backend apps.
- Using nested routes without `meta.parent` and then manually rebuilding hierarchy everywhere.

## Authority

- `docs/content/1.guides/8.resources.md`
- `docs/content/2.integrations/0.vue.md`
- `docs/content/2.integrations/1.nuxt.md`
