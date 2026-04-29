# Core Resources

## Resource Definition

See [Resources](https://ginjou.pages.dev/raw/guides/resources.md) for the route-aware model behind these definitions.

| Field | Purpose |
| --- | --- |
| `name` | Stable semantic resource identifier |
| Action paths | Route patterns for `list`, `create`, `show`, and `edit` |
| `meta` | Extra resource metadata such as parent or fetcher binding |

Use resources when the app needs route-derived `resource` / `id` / `action`, action-based navigation, breadcrumbs, nested hierarchies, or per-resource fetcher selection.

## Action Path Shapes

- a string pattern such as `/posts/:id`
- an object with `{ pattern, parse }`

Use the object form when path creation can stay on one route pattern but route inference needs custom parsing rules.

```ts
const resources = [
	{
		name: 'posts',
		show: {
			pattern: '/posts/:id',
			parse(location) {
				if (location.query?.mode !== 'detail')
					return
				const matched = /^\/posts\/([^/]+)$/.exec(location.path)
				if (!matched)
					return
				return {
					action: ResourceActionType.Show,
					id: matched[1],
				}
			},
		},
	},
]
```

String-based `show` and `edit` patterns rely on a route parameter named `id`. If the route cannot expose that param, use the object form or pass `resource` and `id` explicitly instead of relying on auto-inference.

## Nested Resources

Use `meta.parent` to model hierarchy between resources while keeping resource-specific route patterns.

## Resource `meta` Fields

| Field | Type | Purpose |
| --- | --- | --- |
| `fetcherName` | `string` | Bind the resource to one named fetcher |
| `parent` | `string` | Declare resource hierarchy |
| `hide` | `boolean` | Hide from generated navigation while keeping route behavior |
| `deletable` | `boolean` | Signal that delete behavior should surface in generated navigation |

`meta.fetcherName` only chooses the fetcher. Backend-specific request syntax still belongs to the matching backend reference.

## Route Id Compatibility

- The route pattern must match the real router configuration.
- String `show` and `edit` patterns must expose `:id`.
- If backend id handling differs from the route shape, pass `resource` and `id` explicitly instead of relying on route inference.

## Rules

- Add resources only when the app needs route-aware behavior.
- Keep resource names stable and semantic.
- Use string action paths for straightforward routes and `{ pattern, parse }` when inference needs extra logic.
- Treat `meta.fetcherName` as fetcher selection only, not as a generic backend-normalization layer.
- Pass `resource` and `id` explicitly when route id compatibility is uncertain.
