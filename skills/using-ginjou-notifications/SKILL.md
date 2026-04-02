---
name: using-ginjou-notifications
description: Use when wiring a notification provider for Ginjou, using useNotify, or deciding whether undoable destructive actions are safe when the app has an undo window, progress notification, or no toast and feedback system yet.
---

# Using Ginjou Notifications

## Overview

Use this skill for notification integration and mutation feedback behavior.

Provider responsibilities:
- `open`
- `close`

## Composable Surface

- `useNotify`

## Notification Types

- success
- error
- progress (for undoable mutation windows)

## Undoable Prerequisites

Before treating `undoable` as safe, confirm all of the following:
- notification provider is registered at app root
- provider implements `open`
- provider implements `close`
- progress notifications are supported for the undo window
- the mutation flow is paired with `using-ginjou-forms` or `using-ginjou-data` depending on the surface

## Vue and Nuxt Notes

- Notification provider shape is shared in Vue and Nuxt.
- Register notification context at app root in either framework.

## Decision Rules

- `undoable` mutation mode requires a notification provider.
- Implement `close` to support dismissing progress notifications.
- If the prompt asks whether undoable is safe before a toast or feedback system exists, stop here first and treat notification wiring as a hard prerequisite.
- If the prompt asks what must exist before undoable is safe, answer with the Undoable Prerequisites checklist before discussing forms or data flows.
- If the question is form mutation strategy, pair with `using-ginjou-forms`.
- If the question is direct mutation strategy in custom UI, pair with `using-ginjou-data`.

## Source Map

- `references/notifications.md`
- `https://ginjou.pages.dev/raw/guides/notifications.md`
- `stories/vue/src/Create.stories.ts`
- `stories/vue/src/Update.stories.ts`
- `stories/vue/src/Delete.stories.ts`
