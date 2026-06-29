# Core Mutation Flows

## Create Flow Pattern

See [Forms](https://ginjou.pages.dev/raw/guides/form.md) for create-page behavior.

Use [data-flow.md](./data-flow.md) instead for dialogs, inline tools, and other non-page create actions.

## Edit Flow Pattern

1. Fetch the current record.
2. Submit an update mutation from local editable state.

Copy fetched data into local state before editing so validation, pending changes, and rollback stay local.

## Mutation Mode Boundary

`mutationMode` is not a generic toggle for every mutation flow.

> ⚠️ **Warning:** `mutationMode` only applies to edit, update, and delete flows. `useCreate` does **not** support `mutationMode`.

- Page-level edit flows use it for update timing.
- Lower-level update and delete mutations can use the same mutation-mode model.
- Create flows do not use controller-level `mutationMode`.

Concrete pseudocode shape:

```ts
mutationMode: 'optimistic' | 'pessimistic' | 'undoable'
```

Only edit, update, and delete flows should expose this option.

The three supported modes have different user-facing behavior and redirect timing:

| Mode | User experience | Redirect timing |
| --- | --- | --- |
| `pessimistic` | UI waits for server confirmation before reflecting changes | After the server confirms success |
| `optimistic` | UI updates immediately; rolls back if server fails | Immediately, with rollback/error handling if the mutation fails |
| `undoable` | UI updates immediately with a countdown; user can cancel within the window | After the undo window completes |

Undoable flows require a notification capability. Without notification support,
do not model the flow as undoable.

The undo window is `undoableTimeout` (milliseconds) on the mutation props,
default `5000`. It only applies when `mutationMode: 'undoable'`.

## Local Form State Rule

Never bind page inputs directly to fetched record objects. Copy fetched data
into local form state first, then submit that local state when the user saves.

This keeps read data and editable state separate and avoids mutating cached query data in place.

## Redirect Timing

- Create flows redirect after successful creation.
- Edit flows redirect according to the selected mutation mode.
- If the UI should stay in place after save, treat that as an explicit redirect decision instead of assuming navigation.

## Rules

- Use the create flow for standard create pages and the edit flow for standard edit pages.
- Keep form state local; treat fetched data as source input, not the mutable form model.
- Restrict `mutationMode` guidance to edit, update, and delete flows.
- Require notification capability before recommending `undoable`.
- Use [data-flow.md](./data-flow.md) when the mutation surface is a dialog, row action, widget, or other non-page flow.
