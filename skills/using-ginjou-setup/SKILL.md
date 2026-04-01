---
name: using-ginjou-setup
description: Use when setting up Ginjou in an app root, wiring required providers, or deciding Vue versus Nuxt registration and SSR read composables.
---

# Using Ginjou Setup

## Overview

Use this skill for app-root integration and provider wiring.

This is the right entry point for:
- first-time Ginjou setup
- migration between Vue and Nuxt integration styles
- SSR read composable selection in Nuxt

## Setup Scope

- Required providers:
  - `defineQueryClientContext`
  - `defineFetchersContext`
- Optional providers (add only when needed):
  - auth, authz, i18n, notification, realtime, resources

## Vue Reference

- Package baseline: `@ginjou/vue` + `@tanstack/vue-query`
- Register at app root (`App.vue`)
- Use `defineRouterContext` when route-aware behavior is needed

## Nuxt Reference

- Package baseline: `@ginjou/nuxt` + `@tanstack/vue-query`
- Register in `app.vue` or `app/app.vue`
- Do not call `defineRouterContext` manually in Nuxt

## Nuxt SSR Read Variants

Use async read composables for server-hydrated views:

| Regular | Nuxt SSR |
| --- | --- |
| `useList` | `useAsyncList` |
| `useInfiniteList` | `useAsyncInfiniteList` |
| `useShow` | `useAsyncShow` |
| `useEdit` | `useAsyncEdit` |
| `useSelect` | `useAsyncSelect` |
| `useGetList` | `useAsyncGetList` |
| `useGetOne` | `useAsyncGetOne` |
| `useGetMany` | `useAsyncGetMany` |
| `useGetInfiniteList` | `useAsyncGetInfiniteList` |
| `useAuthenticated` | `useAsyncAuthenticated` |
| `useGetIdentity` | `useAsyncGetIdentity` |
| `useCanAccess` | `useAsyncCanAccess` |
| `usePermissions` | `useAsyncPermissions` |

`useCreate` has no async variant.

## Decision Rules

- Use this skill before feature-level skills when setup status is unclear.
- If backend capability is the main question, pair with `using-ginjou-backends`.
- If resource path resolution is needed, pair with `using-ginjou-resources`.
- Keep provider registration at app root, not inside feature components.
- For multi-backend apps, first register named fetchers in `defineFetchersContext` here, then use `using-ginjou-backends` for backend-specific adapter and auth details.

## Source Map

- `references/setup.md`
- `https://ginjou.pages.dev/raw/integrations/vue.md`
- `https://ginjou.pages.dev/raw/integrations/nuxt.md`
- `packages/vue/src/index.ts`
- `packages/nuxt/src/`
