# Vue Realtime

Use this reference for Vue realtime wiring and realtime helpers. See [Realtime](https://ginjou.pages.dev/raw/guides/realtime.md) for guide-level usage. See [core/realtime.md](../core/realtime.md) for contract, mode selection, and no-transport fallback rules.

> ⚠️ **Warning:** For explicit subscription to data changes, use `useSubscribe()`. Do not rely solely on built-in realtime in data composables — `useSubscribe` is the primary composable for manual subscription control.

## `defineRealtimeContext`

Register the realtime provider once at the app root.

```ts
import { defineRealtimeContext } from '@ginjou/vue'

defineRealtimeContext({
	subscribe: ({ channel, actions, callback, params, meta }) => String(mySocket.on({ channel, actions, params, meta }, callback)),
	unsubscribe: key => mySocket.off(key),
	publish: event => mySocket.emit(event.channel, event),
	options: { mode: 'auto', params: { tenantId: 'team-a' } },
})
```

### Bridging Supabase Realtime

Map the contract onto `supabase.channel(...)`. `subscribe` returns a string key;
`unsubscribe` tears the channel down with that key. `RealtimeAction` values are
`'*'` (Any), `'created'`, `'updated'`, `'deleted'`; the `callback` receives a
`RealtimeEvent` — `{ channel, action, payload, date, meta? }`.

```ts
import { RealtimeAction } from '@ginjou/core'
import { defineRealtimeContext } from '@ginjou/vue'

const channels = new Map<string, ReturnType<typeof supabase.channel>>()
const TO_ACTION = { INSERT: RealtimeAction.Created, UPDATE: RealtimeAction.Updated, DELETE: RealtimeAction.Deleted }

defineRealtimeContext({
	subscribe: ({ channel, callback }) => {
		const key = `${channel}:${crypto.randomUUID()}`
		const ch = supabase
			.channel(key)
			.on('postgres_changes', { event: '*', schema: 'public', table: channel }, (e) => {
				callback({ channel, action: TO_ACTION[e.eventType], payload: e.new ?? e.old, date: new Date() })
			})
			.subscribe()
		channels.set(key, ch)
		return key
	},
	unsubscribe: (key) => {
		const ch = channels.get(key)
		if (ch) {
			supabase.removeChannel(ch)
			channels.delete(key)
		}
	},
	options: { mode: 'auto' },
})
```

With `mode: 'auto'`, ginjou invalidates the matching list/detail queries on each
event, so `useGetList({ resource: 'orders' })` refetches automatically — no
per-component wiring. The Supabase transport must already exist; the provider
only binds it. If it is ever removed, fall back to TanStack Query
`refetchInterval` polling rather than a non-existent ginjou polling flag.

## Automatic Query Subscription

`useGetList`, `useGetOne`, `useGetMany`, and `useGetInfiniteList` auto-subscribe when their realtime path is active. `useCustom` does not; add an explicit `realtime.channel` when custom-query realtime is required.

## `useSubscribe`

`useSubscribe()` registers a reactive subscription that auto-resubscribes when its props change, and returns `stop()` for cleanup.

```ts
import { RealtimeAction } from '@ginjou/core'
import { useSubscribe } from '@ginjou/vue'

const { stop } = useSubscribe({
	channel: 'posts',
	actions: [RealtimeAction.Any],
	callback: event => console.log(event.action),
	params: { type: 'list', resource: 'posts' },
})
```

## `usePublish`

`usePublish()` returns the emit function for local or provider-backed events.

```ts
import { usePublish } from '@ginjou/vue'

const publish = usePublish()
publish({ channel: 'posts', action: 'updated', payload: {}, date: new Date() })
```

## Rules

- Register `defineRealtimeContext` unconditionally at the app root when realtime is in scope.
- Return a string key from `subscribe` and keep `unsubscribe` compatible with it.
- Use `useSubscribe()` for explicit subscriptions and `usePublish()` for manual event emission.
- Do not promise realtime for `useCustom` unless `realtime.channel` is configured.
- Fall back to polling or manual refresh when transport is unavailable.
