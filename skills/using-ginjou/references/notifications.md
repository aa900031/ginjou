# Notifications Reference

Use this reference when wiring a toast/notification system into Ginjou, using `useNotify`, or when implementing undoable mutations.

## Concept

Ginjou triggers notifications automatically on mutation success/error, and uses a progress notification for undoable mutations. Register a provider with `defineNotificationContext` that maps these events to your toast library.

## Provider Setup

```typescript
import { NotificationType } from '@ginjou/core'
import { defineNotificationContext } from '@ginjou/vue'

defineNotificationContext({
  open: (params) => {
    switch (params.type) {
      case NotificationType.Success:
        toast.success(params.message)
        break
      case NotificationType.Error:
        toast.error(params.message, { description: params.description })
        break
      case NotificationType.Progress:
        // Show a progress/undo notification.
        // params.timeout — ms before mutation is committed
        // params.onFinish() — commit the mutation (called when timeout expires)
        // params.onCancel() — cancel and undo the mutation
        toast.progress(params.message, {
          key: params.key,
          timeout: params.timeout,
          onFinish: params.onFinish,
          onCancel: params.onCancel,
        })
        break
    }
  },
  // close is REQUIRED for undoable mutations
  close: (key) => {
    toast.dismiss(key)
  },
})
```

## Composable Usage

```typescript
import { useNotify } from '@ginjou/vue'

const notify = useNotify()
notify({ type: 'success', message: 'Record saved.' })
notify({ type: 'error', message: 'Save failed.', description: err.message })
```

## Notification Types Shape

```typescript
// Success / Error
{ type: 'success' | 'error', message: string, description?: string, key?: string }

// Progress (undoable mutation window)
{ type: 'progress', message: string, key: string, timeout: number, onFinish: () => void, onCancel: () => void }
```

## Undoable Mutations

Setting `mutationMode: 'undoable'` on a form controller or mutation composable triggers a progress notification. The mutation is not committed until `onFinish` is called. The user can cancel via `onCancel`.

```typescript
const { save } = useCreate({
  resource: 'posts',
  mutationMode: 'undoable', // requires notification provider
})
```

## Rules

- Implement both `open` and `close`. `close` is required for undoable mutations to work — it dismisses the in-progress notification.
- `undoable` mutations will silently fail without a notification provider.
- Register `defineNotificationContext` unconditionally at the app root.

## Further Reading

- https://ginjou.pages.dev/guides/notifications
- https://ginjou.pages.dev/guides/form
