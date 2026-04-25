# Vue Notifications

Use this reference for Vue notification wiring and manual notification helpers. See [Notifications](docs/content/1.guides/6.notifications.md) for workflow guidance. See [core/notifications.md](../core/notifications.md) for message shapes and undoable requirements.

## `defineNotificationContext`

Register the notification provider once at the app root.

```ts
import { defineNotificationContext } from '@ginjou/vue'

defineNotificationContext({
	open: params => toast(params.type, params.message, params),
	close: key => toast.dismiss(key),
})
```

`close` is required for undoable flows.

## `useNotify`

`useNotify()` returns the manual notify function.

```ts
import { useNotify } from '@ginjou/vue'

const notify = useNotify()

notify({ type: 'success', message: 'Record saved.' })
```

Use it for manual messages; built-in auth and data helpers already emit the notifications they support.

## Undoable Flows

Edit and lower-level mutation flows can use `mutationMode: 'undoable'` when a working notification provider is registered.

> ⚠️ **Warning:** `mutationMode` (including `undoable`) only applies to edit, update, and delete flows. `useCreate` does **not** support `mutationMode`.

```ts
const { save } = useEdit({
	resource: 'posts',
	id: '1',
	mutationMode: 'undoable',
})
```

Without notification context, manual notify calls are no-ops and undoable flows are unsafe. Prefer pessimistic timing or explicit confirmation instead.

## Rules

- Register `defineNotificationContext` unconditionally at the app root.
- Implement both `open` and `close` when undoable flows are required.
- Use `useNotify()` for manual messages; rely on built-in mutation notifications when the standard data helpers already cover the flow.
- Do not recommend undoable mode unless notification wiring already exists.
