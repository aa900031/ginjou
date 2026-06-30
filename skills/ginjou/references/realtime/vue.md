# Vue Realtime

Use this reference for Vue realtime wiring and realtime helpers. See [Realtime](https://ginjou.pages.dev/raw/guides/realtime.md) for guide-level usage, contract walkthroughs, and query-integration examples.

## Contract

```ts
interface Realtime {
	subscribe: SubscribeFn<any, any>
	unsubscribe?: UnsubscribeFn
	publish?: PublishFn<any>
	options?: RealtimeContextOptions<any>
}
```

The provider only binds an already-existing transport into the shared contract. It does not create websocket, SSE, or backend event transport for you.

Subscription signature:

```
subscribe({ channel, actions, callback, params, meta }) => string
```

The returned string key is passed back to `unsubscribe` during cleanup when an unsubscribe function exists. `params` can model list, one-record, many-record, or custom subscription state.

`RealtimeAction` values:

- `RealtimeAction.Any`
- `RealtimeAction.Created`
- `RealtimeAction.Updated`
- `RealtimeAction.Deleted`

Mode selection:

- `auto` for invalidate-and-refetch behavior
- `manual` for event-specific callback behavior

Provider-level `options` only include `mode`, `callback`, and `params`. Channel selection stays on each subscription.

Transport boundary and fallback:

- If transport exists, subscribe through the realtime provider.
- If transport does not exist or is unconfirmed, say so explicitly.
- Choose polling, manual refresh, or a hybrid fallback instead of promising push updates. Start with conservative polling intervals and add a visible refresh or last-updated affordance when realtime is unavailable.

> ⚠️ **Warning:** Built-in data composables (`useGetList`, `useGetOne`, `useGetMany`, `useGetInfiniteList`) auto-subscribe and are the right default for keeping a view in sync once a provider is registered. Reach for `useSubscribe()` only when you need explicit, manual subscription control outside those composables.

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

`useGetList`, `useGetOne`, `useGetMany`, and `useGetInfiniteList` all auto-subscribe when a realtime provider is registered — pass nothing extra per call. `useCustom` does not; add an explicit `realtime.channel` when custom-query realtime is required.

### Modes: `auto` vs `manual`

Set the mode in the provider `options` (or per subscription):

- **`auto`** (default) — ginjou invalidates the matching queries on each event, so the auto-subscribed list/detail composables refetch. Use this when "the screen should reflect changes".
- **`manual`** — ginjou runs your `callback` only and does **not** touch the query cache. Use this for event-specific side effects (a toast, a counter) without an automatic refetch.

They are not interchangeable: `auto` updates the data, `manual` only notifies.

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

- Require a real transport before promising realtime behavior; register `defineRealtimeContext` unconditionally at the app root when realtime is in scope.
- Make `subscribe` return a string key and keep `unsubscribe` compatible with that key.
- Keep provider-level options limited to mode, callback, and params.
- Use `useSubscribe()` for explicit subscriptions and `usePublish()` for manual event emission.
- Choose `auto` by default and switch to `manual` only when event-specific behavior is required.
- Do not promise realtime for `useCustom` unless `realtime.channel` is configured.
- Treat no-transport fallback (polling or manual refresh) as a first-class answer, not as an afterthought.
