# Vue Realtime

Use this reference for Vue realtime wiring and realtime helpers. See [Realtime](docs/content/1.guides/7.realtime.md) for guide-level usage. See [core/realtime.md](../core/realtime.md) for contract, mode selection, and no-transport fallback rules.

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
