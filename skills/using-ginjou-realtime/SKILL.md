---
name: using-ginjou-realtime
description: Use when implementing realtime subscriptions, event-driven invalidation, auto or manual realtime mode, or fallback refresh strategies in Ginjou.
---

# Using Ginjou Realtime

## Overview

Use this skill for live-update behavior built on a realtime provider.

Provider responsibilities:
- `subscribe`
- `unsubscribe`
- optional `publish`

## Realtime Modes

- Auto mode: invalidate and refetch on matching events.
- Manual mode: custom callback for event-specific behavior.

## Vue and Nuxt Notes

- Realtime provider contract is shared across Vue and Nuxt.
- If transport is missing, realtime features must degrade to polling/manual refresh.

## Decision Rules

- `subscribe` must return a string key used by `unsubscribe`.
- Do not claim websocket-like behavior if backend transport is absent.
- Pair with `using-ginjou-data` or `using-ginjou-lists` depending on which read flows are being refreshed.

## Source Map

- `references/realtime.md`
- `https://ginjou.pages.dev/raw/guides/realtime.md`
- `packages/core/src/realtime/index.ts`
