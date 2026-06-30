# Svelte Notifications

Notification wiring and the manual notify helper for Svelte 5. See [Notifications](https://ginjou.pages.dev/raw/guides/notifications.md) for workflow guidance and built-in notify behavior. This file pins the Svelte syntax.

## Contract

```ts
interface Notification {
	open: NotificationOpenFn
	close: NotificationCloseFn
}
```

Normal notifications carry:

- `type: 'success' | 'error'`
- `message`
- optional `description`
- optional `key`

Progress notifications carry:

- `type: 'progress'`
- `message`
- `key`
- `timeout`
- `onFinish`
- `onCancel`

Undoable mutation flows depend on the progress-notification shape. The provider must be able to show a pending state, commit on finish, and cancel on demand. Undoable mutation mode requires a notification provider so the UI can render the undo action and countdown state.

Without notification capability, do not model the flow as undoable. Prefer a safer fallback such as pessimistic timing or explicit confirmation.

## `defineNotificationContext`

```svelte
<script lang="ts">
import { defineNotificationContext } from '@ginjou/svelte'

defineNotificationContext({
  open: (p) => toast(p.type, p.message, p),
  close: (key) => toast.dismiss(key), // required for undoable flows
})
</script>
```

## `useNotify`

`useNotify()` returns the notify function directly:

```svelte
<script lang="ts">
import { useNotify } from '@ginjou/svelte'

const notify = useNotify()
// notify({ type: 'success', message: 'Saved.' })
</script>
```

Use it for manual messages; built-in auth and data helpers already emit the notifications they support.

## Undoable Flows

Edit and lower-level mutation flows can use `mutationMode: 'undoable'` when a working notification provider is registered.

> ⚠️ **Warning:** `mutationMode` (including `undoable`) only applies to edit, update, and delete flows. `useCreate` does **not** support `mutationMode`.

```svelte
<script lang="ts">
import { useEdit } from '@ginjou/svelte'

const { save } = useEdit({
  resource: 'posts',
  id: '1',
  mutationMode: 'undoable',
})
</script>
```

Without notification context, manual notify calls are no-ops and undoable flows are unsafe. Prefer pessimistic timing or explicit confirmation instead.

### Rendering the undo affordance

For undoable mode, Ginjou calls the provider's `open` with a **progress**
notification your toast must render with an undo control:

| Field | Meaning |
| --- | --- |
| `type` | `'progress'` |
| `message` | Text to show |
| `key` | Stable id; pass to `close(key)` |
| `timeout` | Undo window in ms (from the mutation's `undoableTimeout`, default `5000`) |
| `onFinish` | Call when the window elapses (commit) |
| `onCancel` | Call when the user clicks undo (rollback) |

So `open` should branch on `params.type === 'progress'`, wire the toast's undo
button to `params.onCancel`, and wire dismissal/timeout to `params.onFinish`. Set
the duration from the mutation call:

```ts
await deleteOne({ resource: 'posts', id: '1', mutationMode: 'undoable', undoableTimeout: 5000 })
```

## Rules

- Register `defineNotificationContext` unconditionally at the app root.
- Implement both `open` and `close` when you need `mutationMode: 'undoable'` (which applies to edit/update/delete, never `useCreate`).
- Keep notification rendering inside the provider; feature code should emit notification intent (via `useNotify()` for manual messages), not toast-library details. Rely on built-in mutation notifications when the standard data helpers already cover the flow.
- Treat progress notifications as required infrastructure for undoable UX; do not recommend undoable mode unless notification wiring already exists.
- Without notification context, `useNotify` is a no-op and undoable is unsafe — prefer pessimistic timing or explicit confirmation.
