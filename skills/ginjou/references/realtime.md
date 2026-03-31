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
import { defineRealtimeContext } from '@ginjou/vue'

defineRealtimeContext({
  subscribe: (channel, params, callback) => {
    // subscribe to a channel, returns a string key (UnsubscribeKey)
    const id = mySocket.on(channel, callback)
    return id // must return a string key
  },
  unsubscribe: (key) => {
    // key is the value returned by subscribe
    mySocket.off(key)
  },
  publish: (event) => {
    // optional — emit a local event to trigger subscriptions
    mySocket.emit(event.channel, event)
  },
})
```

### Unsubscribe Flow

`subscribe` must return a **string** key (not a function). The returned key is passed to `unsubscribe` when cleanup occurs.

```typescript
const key = subscribe(channel, params, callback) // key: string
unsubscribe(key)                                  // cleanup by key
```

## Auto Mode Example

Auto mode is the default. When a realtime event for a resource arrives, Ginjou automatically invalidates that resource's queries and triggers a refetch. No special configuration is needed on the query composable side.

```typescript
// Realtime auto mode — just use data composables normally
const { records } = useGetList({ resource: 'posts' })
// When a 'posts' realtime event arrives, this list refetches automatically
```

## Manual Mode Example

Use manual mode when you need to react differently to specific event types, or when you want to update local state without triggering a full refetch.

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
      console.log('Server event:', event)
      // manually update local state, trigger custom side effects, etc.
    },
  },
})
```

## `RealtimeAction` Constants

Import from `@ginjou/core`:

```typescript
import { RealtimeAction } from '@ginjou/core'
// RealtimeAction.Create | RealtimeAction.Update | RealtimeAction.Delete | RealtimeAction.Any
```

## Common Mistakes

- Choosing manual mode when auto invalidation is simpler.
- Returning a cleanup function from `subscribe` instead of a string key — `unsubscribe` expects the key returned by `subscribe`.
- Putting event-handling rules into random components instead of a deliberate realtime strategy.
- Mixing realtime requirements with notification or auth concerns in the same provider.
- Registering `defineRealtimeContext` conditionally instead of at the app root.

## Authority

- https://ginjou.pages.dev/guides/realtime
- https://ginjou.pages.dev/backend/rest-api
- https://ginjou.pages.dev/backend/supabase
- https://ginjou.pages.dev/backend/directus
