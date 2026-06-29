# Svelte Realtime

Realtime wiring and helpers for Svelte 5. **`defineRealtimeContext`,
`useSubscribe`, `usePublish`, auto-subscription behavior, and fallback rules
match Vue** — read [vue/realtime.md](../vue/realtime.md) and
[core/realtime.md](../core/realtime.md). This file pins only the Svelte syntax.

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

## Rules

- Return a string key from `subscribe`; keep `unsubscribe` compatible.
- `useCustom` does not auto-subscribe — add `realtime.channel` if needed.
- Fall back to polling/manual refresh when no transport is configured. (Same as Vue/core.)
