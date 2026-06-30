# Svelte Realtime

Realtime wiring and helpers for Svelte 5. See [Realtime](https://ginjou.pages.dev/raw/guides/realtime.md) for guide-level usage, contract walkthroughs, and query-integration examples. This file pins the Svelte syntax.

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

## `defineRealtimeContext`

```svelte
<script lang="ts">
import { defineRealtimeContext } from '@ginjou/svelte'

defineRealtimeContext({
  subscribe: ({ channel, actions, callback, params, meta }) => String(socket.on({ channel, actions, params, meta }, callback)),
  unsubscribe: (key) => socket.off(key),
  publish: (event) => socket.emit(event.channel, event),
  options: { mode: 'auto' },
})
</script>
```

`useGetList`/`useGetOne`/`useGetMany`/`useGetInfiniteList` auto-subscribe when a
realtime path is active. For explicit control use `useSubscribe` (pass an
accessor when its props are reactive); it returns `stop()` for cleanup. Pair
`stop()` with an `$effect` cleanup when the subscription should end with the
component.

### Modes: `auto` vs `manual`

Set the mode in the provider `options` (or per subscription):

- **`auto`** (default) — ginjou invalidates the matching queries on each event, so the auto-subscribed list/detail composables refetch. Use this when "the screen should reflect changes".
- **`manual`** — ginjou runs your `callback` only and does **not** touch the query cache. Use this for event-specific side effects (a toast, a counter) without an automatic refetch.

They are not interchangeable: `auto` updates the data, `manual` only notifies.

## `useSubscribe`

```svelte
<script lang="ts">
import { RealtimeAction } from '@ginjou/core'
import { useSubscribe } from '@ginjou/svelte'

const sub = useSubscribe(() => ({
  channel: 'posts', actions: [RealtimeAction.Any],
  callback: (e) => console.log(e.action),
  params: { type: 'list', resource: 'posts' },
}))
$effect(() => () => sub.stop())
</script>
```

`usePublish()` returns the emit function for local or provider-backed events.

## Rules

- Require a real transport before promising realtime behavior; register `defineRealtimeContext` unconditionally at the app root when realtime is in scope.
- Return a string key from `subscribe`; keep `unsubscribe` compatible with that key.
- Keep provider-level options limited to mode, callback, and params.
- Use `useSubscribe()` for explicit subscriptions (pass an accessor when props are reactive) and `usePublish()` for manual event emission.
- Choose `auto` by default and switch to `manual` only when event-specific behavior is required.
- `useCustom` does not auto-subscribe — add `realtime.channel` if needed.
- Treat no-transport fallback (polling or manual refresh) as a first-class answer, not as an afterthought.
