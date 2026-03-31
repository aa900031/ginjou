# Notifications Reference

Use this reference when the task includes wiring toast or notification systems into Ginjou, using `useNotify`, progress notifications, or undoable mutation UX in a Ginjou app.

## Provider Rule

Notifications are an app-level integration. Register them once with `defineNotificationContext` and let components trigger them through `useNotify` or built-in mutation flows.

## Main Composable

- `useNotify` — imperatively fire a notification

## Provider Contract

```typescript
import { NotificationType } from '@ginjou/core'
import { defineNotificationContext } from '@ginjou/vue'

defineNotificationContext({
  open: (params) => {
    switch (params.type) {
      case NotificationType.Success:
      case NotificationType.Error:
        // show a toast with params.message and optional params.description
        break
      case NotificationType.Progress:
        // show a progress notification
        // params.timeout — milliseconds before auto-finish
        // params.onFinish() — called when timeout expires
        // params.onCancel() — called when user cancels (undo)
        break
    }
  },
  // close is REQUIRED for undoable mutations — called with the key to dismiss
  close: (key) => {
    // dismiss the notification identified by key
  },
})
```

### `OpenNotificationParams` Shape

```typescript
type OpenNotificationParams
  = | { type: 'success' | 'error', message: string, description?: string, key?: string }
    | { type: 'progress', message: string, key?: string, timeout: number, onFinish: () => void, onCancel: () => void }
```

## Composable Usage

```typescript
import { useNotify } from '@ginjou/vue'

const notify = useNotify()
notify({ type: 'success', message: 'Saved.' })
notify({ type: 'error', message: 'Failed.', description: err.message })
// The 'progress' type is triggered automatically by undoable mutations — rarely called manually
```

## Guidance

- Implement both `open` **and** `close`. `close` is required for undoable mutations to function — it dismisses the progress notification when the mutation settles or is cancelled.
- Support `progress` notifications when the UX includes undo windows or long-running actions.
- `undoable` mutations require a notification provider — see the forms reference for the full undoable mutation setup.
- Keep notification rendering concerns inside the notification adapter, not inside business logic.

## Common Mistakes

- Using `undoable` mutation flows without registering a notification provider.
- Implementing only `open` and omitting `close` — this breaks undoable mutations.
- Treating notifications as page-local state instead of an app-level capability.
- Registering `defineNotificationContext` conditionally instead of at the app root.

## Authority

- https://ginjou.pages.dev/guides/notifications
- https://ginjou.pages.dev/guides/form
