# Forms Behavior (core)

## Create Flow Pattern

See [Forms](https://ginjou.pages.dev/raw/guides/form.md) for create-page behavior.

Use [../data/behavior.md](../data/behavior.md) instead for dialogs, inline tools, and other non-page create actions.

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

## Unsaved Changes Guard

Two entry points:

1. Form controller: `useCreate` / `useEdit` accept `warnUnsaved?: WarnUnsaved.Prop` and return `warnUnsavedActive`.
2. Standalone: `useWarnUnsaved(props?, context?)`.

`WarnUnsaved.Props` (from `@ginjou/core`):

| Prop | Type | Required | Default |
| --- | --- | --- | --- |
| `enabled` (standalone) | `boolean` | optional | `false` (`WarnUnsaved.defaultEnabled = false`) |
| `enabled` (object passed to a controller's `warnUnsaved`) | `boolean` | optional | `true` |
| `confirm` | `() => boolean \| Promise<boolean>` | optional | native `globalThis.confirm('You have unsaved changes. Are you sure you want to leave this page?')` |
| `blockLeaving` | `boolean` | optional | `true` |

`WarnUnsaved.Prop = boolean | WarnUnsaved.Props | undefined`, so the controller prop also accepts a bare `true`.

Precedence for `enabled` and `confirm`: the hook's own prop when non-null, else the app-level `warnUnsaved` on `defineControllerContext`, else the default. A `warnUnsaved` prop on `useCreate` / `useEdit` counts as the hook's own prop, not as a middle layer.

`WarnUnsaved.State` = `{ Inactive: 'inactive', Active: 'active', Confirming: 'confirming' }`. `'confirming'` means a `confirm()` is in flight.

> ⚠️ **Warning:** The app must set `active` (or `warnUnsavedActive`) to `true` itself when the form becomes dirty. The block predicate is `active && …`, so the guard is inert until it is set.

A successful `save()` sets `warnUnsavedActive` back to `false` for you, and a failed optimistic / undoable save restores the value it had. Do not reset it by hand after `save()`.

A `confirm()` that **throws** is treated as `false`, so the navigation is cancelled.

Contrast `useRouteBlocker`, whose `enabled` defaults to `true`. In Nuxt, `useWarnUnsaved` is auto-imported; `useRouteBlocker` is not.

Its predicate is a `path` **string** comparison only: block when `active` and (`nextLocation == null` — an unload — or `nextLocation.path !== currentLocation.path`). With `blockLeaving: false` it blocks every navigation instead, including same-path and query-only ones.

> ⚠️ **Warning:** Because it compares paths only, it is wrong for nested-route forms. A child route / tab switch (`/posts/1/edit` → `/posts/1/edit/preview`) and an aliased path (`/posts/1` → `/p/1`) are treated as leaves. Those cases need a hand-written `useRouteBlocker` with a router-aware predicate — see [../router/behavior.md](../router/behavior.md), plus the [vue-router adapter](https://ginjou.pages.dev/raw/adapters/vue-router.md) for Vue or [../router/svelte.md](../router/svelte.md) for Svelte.

Unload (tab close, reload) and the no-blocker case follow the route blocker — see [../router/behavior.md](../router/behavior.md).

## Rules

- Use the create flow for standard create pages and the edit flow for standard edit pages.
- Keep form state local; treat fetched data as source input, not the mutable form model.
- Restrict `mutationMode` guidance to edit, update, and delete flows.
- Require notification capability before recommending `undoable`.
- Use [../data/behavior.md](../data/behavior.md) when the mutation surface is a dialog, row action, widget, or other non-page flow.
- Set `active` / `warnUnsavedActive` to `true` from the form's dirty state; `save()` clears it, so never reset it by hand afterwards.
- Pass `enabled: true` (or a bare `warnUnsaved: true`) for standalone `useWarnUnsaved`; it defaults to `false`.
- Keep `blockLeaving` at its default; `blockLeaving: false` blocks every navigation, query-only ones included.
- Do not use `useWarnUnsaved` for nested-route or aliased-path forms; write a `useRouteBlocker` predicate instead.
