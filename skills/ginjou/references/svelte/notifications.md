# Svelte Notifications

Notification wiring and the manual notify helper for Svelte 5.
**`defineNotificationContext`, `useNotify`, and the undoable rules match Vue** —
read [vue/notifications.md](../vue/notifications.md) and
[core/notifications.md](../core/notifications.md). This file pins only the Svelte
syntax.

```svelte
<script lang="ts">
import { defineNotificationContext } from '@ginjou/svelte'

defineNotificationContext({
  open: (p) => toast(p.type, p.message, p),
  close: (key) => toast.dismiss(key), // required for undoable flows
})
</script>
```

`useNotify()` returns the notify function directly:

```svelte
<script lang="ts">
import { useNotify } from '@ginjou/svelte'

const notify = useNotify()
// notify({ type: 'success', message: 'Saved.' })
</script>
```

## Rules

- Implement both `open` and `close` when you need `mutationMode: 'undoable'` (which applies to edit/update/delete, never `useCreate`).
- Without notification context, `useNotify` is a no-op and undoable is unsafe — prefer pessimistic timing. (Same as Vue/core.)
