# Realtime Reference

Use this reference when the app needs live updates, auto-refreshing lists, or server-event-driven behavior.

## Concept

Ginjou realtime works through a provider registered with `defineRealtimeContext`. Once connected, data composables automatically subscribe to channels for their resources. Two modes are available: `auto` (invalidate and refetch on any event) and `manual` (custom callback per event).

Ginjou does not create a websocket or backend event transport for you. The realtime provider only bridges an existing subscription source into Ginjou. If the backend cannot emit events, say so and use polling, manual refresh, or a custom realtime transport instead.

When realtime is unavailable, keep using the normal query or controller composables for reads and trigger refetches from the UI or an app-level polling loop.

## Backend Fallback Matrix

Use this matrix when the backend cannot emit realtime events in the current environment.

| Backend | Default realtime path | No-transport fallback | Notes |
| --- | --- | --- | --- |
| REST API | Custom transport only (if implemented by the app) | Polling or manual refetch is the default strategy | REST fetchers typically need pull-based refresh unless app adds websocket/SSE transport |
| Supabase | Use Supabase realtime transport when available | Polling/manual refetch if transport is disabled or unavailable | Keep query/meta behavior in [backend-supabase.md](./backend-supabase.md) |
| Directus | Use Directus event transport when available | Polling/manual refetch if transport is disabled or unavailable | Keep query/meta behavior in [backend-directus.md](./backend-directus.md) |

## Polling Cadence Guidance

- Start with a conservative cadence (for example, 10-30 seconds) for list refresh.
- Increase interval when backend load is high, or when data freshness requirements are lower.
- Use manual refetch controls when frequent polling is not acceptable for the page.
- Always state when the backend does not provide transport, instead of promising subscriptions.

## Fallback Execution Profiles

Use one of these concrete profiles when transport is unavailable.

| Profile | When to use | Refresh trigger | Starting cadence | Required UX note |
| --- | --- | --- | --- | --- |
| Polling | Data should stay reasonably fresh without user action | Time-based pull | 10-30 seconds for active lists, 15-60 seconds for summary surfaces | Show last-updated timestamp |
| Manual | Data changes infrequently or backend budget is strict | User-triggered refresh | No timer | Provide an explicit refresh action |
| Hybrid | Moderate freshness needed with bounded load | Slow polling plus manual refresh | 20-60 seconds plus on-demand refresh | Show both refresh action and last-updated timestamp |

## Fallback Answer Minimum

When recommending fallback, include all of the following:

1. Transport status statement: subscriptions are unavailable in this environment.
2. Chosen strategy name: polling, manual, or hybrid.
3. One concrete cadence value or range if timer-based.
4. One tuning rule: increase interval under load; decrease only when freshness requirements justify it.
5. One UX safeguard: explicit refresh action and/or last-updated indicator.
6. One backend note from the matching backend reference (`backend-rest-api.md`, `backend-supabase.md`, or `backend-directus.md`).

## Per-Resource Transport Check

Treat transport availability as resource/surface-specific, not backend-global.

1. Check whether this resource/surface has confirmed transport.
2. If not confirmed, assume no transport and use fallback profile immediately.
3. Keep wording capability-safe: no push subscription promise without confirmation.

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
- Choose fallback strategy by backend capability (REST pull-first; Supabase/Directus transport when available, otherwise pull).
- For fallback decisions, check transport per resource/surface before choosing strategy.
- Document the chosen polling cadence when recommending a fallback strategy.
- For no-transport answers, include strategy name, cadence, and one UX safeguard in the response.
- Register `defineRealtimeContext` unconditionally at the app root.

## Further Reading

- https://ginjou.pages.dev/guides/realtime
