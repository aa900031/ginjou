# Realtime Reference

Use this reference when the app needs live updates, auto-refreshing lists, or server-event-driven behavior.

## Concept

Ginjou realtime works through a provider registered with `defineRealtimeContext`. Once connected, data composables automatically subscribe to channels for their resources. Two modes are available: `auto` (invalidate and refetch on any event) and `manual` (custom callback per event).

Ginjou does not create a websocket or backend event transport for you. The realtime provider only bridges an existing subscription source into Ginjou. If the backend cannot emit events, say so and use polling, manual refresh, or a custom realtime transport instead.

When realtime is unavailable, keep using the normal query or controller composables for reads and trigger refetches from the UI or an app-level polling loop.

## Provider Setup

```typescript
import { defineRealtimeContext } from '@ginjou/vue'

defineRealtimeContext({
  subscribe: (channel, params, callback) => {
    // Subscribe and return a string key
    const id = mySocket.on(channel, callback)
    return String(id) // must be a string — used by unsubscribe
  },
  unsubscribe: (key) => {
    mySocket.off(key)
  },
  publish: (event) => {
    // Optional — emit a local event to trigger subscriptions
    mySocket.emit(event.channel, event)
  },
})
```

## Auto Mode (Default)

Auto mode is the default. When a realtime event arrives for a resource, Ginjou automatically invalidates that resource's queries and triggers a refetch. No special config on the composable side.

```typescript
// The list refetches automatically when a 'posts' event arrives
const { records } = useGetList({ resource: 'posts' })
```

## Manual Mode

Use manual mode when different event types need different side effects, or to update state without a full refetch.

```typescript
import { RealtimeMode } from '@ginjou/core'
import { useGetOne } from '@ginjou/vue'

const { record } = useGetOne({
  resource: 'posts',
  id: '1',
  realtime: {
    mode: RealtimeMode.Manual,
    callback: (event) => {
      // event: { channel, action, payload: { ids }, date }
      console.log('Realtime event:', event.action, event.payload)
      // Apply custom side effects here
    },
  },
})
```

## `RealtimeAction` Constants

```typescript
import { RealtimeAction } from '@ginjou/core'
// RealtimeAction.Create | RealtimeAction.Update | RealtimeAction.Delete | RealtimeAction.Any
```

## Rules

- `subscribe` must return a **string** — the value is passed to `unsubscribe` for cleanup.
- The backend or socket layer must provide a real subscribe/unsubscribe transport. Without that, use polling or manual refresh instead of promising realtime.
- Default to auto mode unless the app needs event-specific reactions.
- Register `defineRealtimeContext` unconditionally at the app root.

## Further Reading

- https://ginjou.pages.dev/guides/realtime
