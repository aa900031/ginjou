---
name: using-ginjou
description: Use when the user is building or integrating a Ginjou app in Vue or Nuxt, asks about Ginjou CRUD controllers or data composables (`useList`, `useShow`, `useCreate`, `useEdit`, `useSelect`) for pages or non-page UI such as dialogs, buttons, and widgets, or needs auth, authz, notifications, i18n, realtime, resource routing, fetcher setup, backend choice, multi-backend wiring, or backend-specific options for REST API, Supabase, or Directus.
---

# Using Ginjou

## Overview

Ginjou is a headless, framework-agnostic library for building admin panels, dashboards, and data-intensive apps. It connects UI components to backends through standardized providers and composables.

Always treat the source code and the official docs as the authority. Do not invent provider patterns, route conventions, or controller flows.

## Quick Start

1. Identify the framework (Vue or Nuxt) and backend (REST API, Supabase, Directus, or custom).
2. Match the task to a reference below and read it before writing code.
3. If the task compares backends or combines multiple backends, read more than one reference instead of answering from memory.
4. Register providers at the app root; skip providers the app does not use.

## Reference Map

| Task | Reference |
| --- | --- |
| Install Ginjou, register providers, wire fetchers, SSR setup | [setup.md](./references/setup.md) |
| Define resource routes, URL mapping, nested resources, multi-backend | [resources.md](./references/resources.md) |
| List pages, detail pages, infinite scroll, select inputs | [controllers.md](./references/controllers.md) |
| Create forms, edit forms, delete actions, form state init | [forms.md](./references/forms.md) |
| Non-page CRUD, dialogs, bulk actions, custom endpoints, low-level queries/mutations | [data-composables.md](./references/data-composables.md) |
| Login, logout, auth status, identity, session checks | [authentication.md](./references/authentication.md) |
| Permission checks, access control, role-based UI | [authorization.md](./references/authorization.md) |
| Toasts, notification provider, undoable mutations | [notifications.md](./references/notifications.md) |
| Live updates, auto-refresh, realtime subscriptions | [realtime.md](./references/realtime.md) |
| Localization, translation, locale switching | [i18n.md](./references/i18n.md) |
| Choose between REST API, Supabase, Directus, or compare backend trade-offs | [setup.md](./references/setup.md) |
| REST API backend setup and meta options | [backend-rest-api.md](./references/backend-rest-api.md) |
| Supabase backend setup, auth methods, meta options | [backend-supabase.md](./references/backend-supabase.md) |
| Directus backend setup, auth methods, meta options | [backend-directus.md](./references/backend-directus.md) |

## Reference Combos

- Backend choice, backend-specific auth, or backend-specific `meta` questions: start with [setup.md](./references/setup.md), then continue to the matching backend reference. Do not answer these from the generic auth or controller guides alone.
- Multi-backend Vue or Nuxt setup: read [setup.md](./references/setup.md) for root wiring, SSR rules, and `useAsync*` reads, then read [resources.md](./references/resources.md) for per-resource `meta.fetcherName` binding.
- Supabase or Directus auth methods: read the matching backend reference before [authentication.md](./references/authentication.md). The backend references list supported login types; the auth guide explains the common Ginjou surface.
- Realtime questions: read [realtime.md](./references/realtime.md) and confirm the app actually has a realtime transport or provider instead of assuming live updates are available.
- If the backend has no realtime transport, fall back to the normal query or controller references and add polling or manual refetch instead of promising subscriptions.

## Decision Rules

- Vue apps: use `@ginjou/vue`. Add `defineRouterContext` (from `@ginjou/with-vue-router`) when route-aware behavior is needed.
- Nuxt apps: use `@ginjou/nuxt`. Do **not** add `defineRouterContext`; the module handles it. Prefer `useAsync*` composables for SSR pages.
- If the backend is not specified, inspect existing dependencies, fetchers, and environment before assuming REST API, Supabase, or Directus.
- Choose REST API when the app talks to a generic or custom HTTP API, or when the task needs custom headers, a custom client, or method overrides.
- Choose Supabase when the app already uses Supabase or the task mentions Postgrest `select`, `count`, `idColumnName`, or Supabase auth methods.
- Choose Directus when the backend is Directus or the task mentions Directus query fields, filters, aggregates, group-by, or Directus auth.
- Choose `useList` / `useShow` / `useCreate` / `useEdit` for clear standard CRUD pages. Use lower-level composables for anything else.
- Choose `useSelect` for select and autocomplete inputs that load remote options.
- Default mutation mode to `pessimistic` unless the flow explicitly needs optimistic or undoable UX.
- `undoable` requires a notification provider.
- Resources (`defineResourceContext`) are optional — add them only when route-aware resolution, navigation, or multi-backend binding is needed.
- Multi-backend tasks usually need a reference combination: root setup from `setup.md`, resource binding from `resources.md`, and backend-specific `meta` or auth details from the matching backend reference.
- For Supabase or Directus auth-method questions, prefer the matching backend reference before the generic auth guide.
- Realtime only covers subscription wiring and invalidation. If the backend has no event transport, say so and fall back to polling, manual refresh, or a custom provider.
- If it is unclear which composable to use, ask the user before defaulting to a controller.

## Output Standards

- State which reference guided the implementation.
- Call out any framework-specific constraints (SSR, router).
- For backend comparisons, state the comparison criteria and name the backend reference used.
- If the answer depends on multiple references, say which combination guided the answer.
- If controller use is ambiguous, ask instead of assuming.
- Read the relevant reference before writing code — do not guess API shapes.
