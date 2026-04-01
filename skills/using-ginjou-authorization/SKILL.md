---
name: using-ginjou-authorization
description: Use when implementing access checks, role-based UI visibility, and permissions-driven behavior in a Ginjou app.
---

# Using Ginjou Authorization

## Overview

Use this skill for permission and access logic.

Provider contract:
- `access`
- `getPermissions`

## Composable Surface

- `useCanAccess`
- `usePermissions`

## Vue and Nuxt Notes

- Vue uses regular composables.
- Nuxt SSR pages should use:
  - `useAsyncCanAccess`
  - `useAsyncPermissions`

## Decision Rules

- Use `useCanAccess` for specific action/resource checks.
- Use `usePermissions` for broader menu/layout decisions.
- Keep policy logic in the authz provider instead of scattering it across components.
- If the question is login/session/identity, switch to `using-ginjou-authentication`.

## Source Map

- `references/authorization.md`
- `https://ginjou.pages.dev/raw/guides/authorization.md`
- `stories/vue/src/AuthPermissions.stories.ts`
