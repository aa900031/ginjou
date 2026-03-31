# Realtime Reference

Use this reference when the task includes subscriptions, live updates, auto-refreshing lists or tables, or query invalidation driven by server events in a Ginjou app.

## Provider Rule

Realtime is an app-level integration. Register it once with `defineRealtimeContext` and decide whether the app needs automatic invalidation or manual event handling.

## Guidance

- Default to auto mode when invalidation and refetch are enough.
- Use manual mode when different event types should trigger different side effects.
- Keep the provider contract focused on subscribe, unsubscribe, and publish behavior.
- If the user only asks for live updates and does not specify a custom workflow, choose auto mode first.

## Provider Contract

```typescript
interface Realtime {
	subscribe: SubscribeFn<any, any> // returns UnsubscribeKey (a string, not a function)
	unsubscribe?: (key: UnsubscribeKey) => void // call with the key returned by subscribe
	publish?: (event: RealtimeEvent) => void
	options?: RealtimeContextOptions<any>
}
// UnsubscribeKey = string
// Unsubscribe flow: const key = subscribe(...); unsubscribe(key)
```

## Auto Mode Example

```typescript
// Auto mode (default) — Ginjou invalidates queries automatically when events arrive
import { useGetList } from '@ginjou/vue'

// No extra config needed — just use data composables normally
// When a 'posts' event arrives, useGetList for 'posts' auto-refetches
const { records } = useGetList({ resource: 'posts' })
```

## Manual Mode Example

```typescript
import { RealtimeMode } from '@ginjou/core'
// Manual mode — handle events yourself instead of auto-invalidation
import { useGetOne } from '@ginjou/vue'

const { record } = useGetOne({
	resource: 'posts',
	id: '1',
	realtime: {
		mode: RealtimeMode.Manual,
		callback: (event) => {
			// event: { channel, action, payload: { ids }, date }
			console.log('Server event:', event)
		},
	},
})
```

## Common Mistakes

- Choosing manual mode when auto invalidation would be simpler.
- Putting event-handling rules into random components instead of a deliberate realtime strategy.
- Mixing realtime requirements with notification or auth concerns in the same provider abstraction.

## Authority

- https://ginjou.pages.dev/guides/realtime
- https://ginjou.pages.dev/backend/rest-api
- https://ginjou.pages.dev/backend/supabase
- https://ginjou.pages.dev/backend/directus
