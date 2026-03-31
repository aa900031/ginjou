---
name: using-ginjou
description: Use when the user is working with Ginjou (@ginjou/vue, @ginjou/nuxt), starting a Ginjou app, or integrating Ginjou into an existing project. Trigger for any Ginjou CRUD work, including list/detail/select loading and create/update/delete actions in pages or non-page UI, plus login/logout, user validation, permission or access control, notification or toast integration, i18n integration, and live or auto-refreshing data. Also trigger on "Ginjou fetcher", "Ginjou controller", "wire Ginjou", "useList", "useCreate", "useEdit", or "useSelect". Also trigger when choosing between REST API, Supabase, or Directus backends.
---

# Using Ginjou

## Overview

Ginjou is a headless, framework-agnostic library for building admin panels, dashboards, and data-intensive apps. It connects UI components to backends through standardized providers and composables.

Always treat the source code and the official docs as the authority. Do not invent provider patterns, route conventions, or controller flows.

## Quick Start

1. Identify the framework (Vue or Nuxt) and backend (REST API, Supabase, Directus, or custom).
2. Match the task to a reference below and read it before writing code.
3. Register providers at the app root; skip providers the app does not use.

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
| REST API backend setup and meta options | [backend-rest-api.md](./references/backend-rest-api.md) |
| Supabase backend setup, auth methods, meta options | [backend-supabase.md](./references/backend-supabase.md) |
| Directus backend setup, auth methods, meta options | [backend-directus.md](./references/backend-directus.md) |

## Decision Rules

- Vue apps: use `@ginjou/vue`. Add `defineRouterContext` (from `@ginjou/with-vue-router`) when route-aware behavior is needed.
- Nuxt apps: use `@ginjou/nuxt`. Do **not** add `defineRouterContext`; the module handles it. Prefer `useAsync*` composables for SSR pages.
- Choose `useList` / `useShow` / `useCreate` / `useEdit` for clear standard CRUD pages. Use lower-level composables for anything else.
- Choose `useSelect` for select and autocomplete inputs that load remote options.
- Default mutation mode to `pessimistic` unless the flow explicitly needs optimistic or undoable UX.
- `undoable` requires a notification provider.
- Resources (`defineResourceContext`) are optional — add them only when route-aware resolution, navigation, or multi-backend binding is needed.
- If it is unclear which composable to use, ask the user before defaulting to a controller.

## Output Standards

- State which reference guided the implementation.
- Call out any framework-specific constraints (SSR, router).
- If controller use is ambiguous, ask instead of assuming.
- Read the relevant reference before writing code — do not guess API shapes.
