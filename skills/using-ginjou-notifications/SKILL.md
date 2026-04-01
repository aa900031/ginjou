---
name: using-ginjou-notifications
description: Use when wiring a notification provider for Ginjou, using useNotify, or implementing undoable mutation UX and progress notifications.
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

## Vue and Nuxt Notes

- Notification provider shape is shared in Vue and Nuxt.
- Register notification context at app root in either framework.

## Decision Rules

- `undoable` mutation mode requires a notification provider.
- Implement `close` to support dismissing progress notifications.
- If the question is form mutation strategy, pair with `using-ginjou-forms`.
- If the question is direct mutation strategy in custom UI, pair with `using-ginjou-data`.

## Source Map

- `references/notifications.md`
- `https://ginjou.pages.dev/raw/guides/notifications.md`
- `stories/vue/src/Create.stories.ts`
- `stories/vue/src/Update.stories.ts`
- `stories/vue/src/Delete.stories.ts`
