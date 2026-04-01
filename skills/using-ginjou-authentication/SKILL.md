---
name: using-ginjou-authentication
description: Use when implementing login, logout, session checks, identity loading, or authentication error handling in a Ginjou app.
---

# Using Ginjou Authentication

## Overview

Use this skill for authentication lifecycle behavior.

Core provider contract:
- `login`
- `logout`
- `check`
- `checkError`
- optional `getIdentity`

## Composable Surface

- `useAuthenticated`
- `useLogin`
- `useLogout`
- `useGetIdentity`
- `useCheckError`

## Vue and Nuxt Notes

- Vue uses regular auth composables.
- Nuxt SSR pages should use async read variants:
  - `useAsyncAuthenticated`
  - `useAsyncGetIdentity`
- `useLogin`, `useLogout`, and `useCheckError` are mutation-style and remain non-async variants.

## Backend-Specific Auth

- REST API: custom auth provider implementation.
- Supabase and Directus: use backend adapters and backend-specific login payload types.

## Decision Rules

- Keep authentication and authorization separate.
- `401` usually indicates session expiration logic.
- `403` is authorization failure, not forced logout.
- If the main question is role/action access, switch to `using-ginjou-authorization`.

## Source Map

- `references/authentication.md`
- `https://ginjou.pages.dev/raw/guides/authentication.md`
- `https://ginjou.pages.dev/raw/backend/rest-api.md`
- `https://ginjou.pages.dev/raw/backend/supabase.md`
- `https://ginjou.pages.dev/raw/backend/directus.md`
- `stories/vue/src/Auth.stories.ts`
- `stories/vue/src/AuthGetIdentity.stories.ts`
- `stories/vue/src/AuthCheckError.stories.ts`
