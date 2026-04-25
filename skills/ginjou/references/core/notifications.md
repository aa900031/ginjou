# Core Notifications

## Notification Contract

See [Notifications](docs/content/1.guides/6.notifications.md) for provider examples and built-in notify behavior.

```ts
interface Notification {
	open: NotificationOpenFn
	close: NotificationCloseFn
}
```
## Message Shapes

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

## Undoable Boundary

Undoable mutation flows depend on the progress-notification shape. The provider must be able to show a pending state, commit on finish, and cancel on demand.

Undoable mutation mode requires a notification provider so the UI can render the undo action and countdown state.

Without notification capability, do not model the flow as undoable. Prefer a safer fallback such as pessimistic timing or explicit confirmation.

## Rules

- Implement both open and close when undoable flows are in scope.
- Keep notification rendering inside the provider; feature code should emit notification intent, not toast-library details.
- Treat progress notifications as required infrastructure for undoable UX.
- Fall back to pessimistic or manual-confirmation flows when notification support is absent.
