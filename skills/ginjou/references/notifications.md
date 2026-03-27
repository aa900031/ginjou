# Notifications Reference

Use this reference when the task includes toast messages, progress notifications, or undoable mutation UX in a Ginjou app.

## Provider Rule

Notifications are an app-level integration. Register them once with `defineNotificationContext` and let components trigger them through `useNotify` or built-in mutation flows.

## Main Composable

- `useNotify`

## Provider Contract

```typescript
// Implement both open AND close — close is required for undoable mutations to cancel
interface Notification {
  open:  (params: OpenNotificationParams) => void
  close: (key: string) => void
}

type OpenNotificationParams =
  | { type: 'success' | 'error'; message: string; description?: string; key?: string }
  | { type: 'progress'; message: string; key?: string; timeout: number;
      onFinish: () => void; onCancel: () => void }  // required for undoable mutations
```

## Composable Usage

```typescript
const notify = useNotify()
notify({ type: 'success', message: 'Saved.' })
notify({ type: 'error', message: 'Failed.', description: err.message })
// progress type is triggered automatically by undoable mutations — rarely called manually
```

## Guidance

- Implement both `open` and `close`.
- Support progress notifications when the UX includes long-running actions or undo windows.
- `undoable` mutations require a notification provider — see `references/forms.md` for the full undoable mutation setup guidance.
- Keep notification rendering concerns inside the notification adapter, not inside business logic.

## Common Mistakes

- Using `undoable` mutation flows without notifications.
- Treating notifications as page-local state instead of an app-level capability.
- Forgetting progress behavior when long-running actions need cancellation or completion hooks.

## Authority

- https://ginjou.pages.dev/guides/notifications
- https://ginjou.pages.dev/guides/form
