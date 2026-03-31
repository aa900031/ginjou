---
name: ginjou
description: Use when the user is working with Ginjou (@ginjou/vue, @ginjou/nuxt), starting a Ginjou app, or integrating Ginjou into an existing project. Trigger for any Ginjou CRUD work, including list/detail/select loading and create/update/delete actions in pages or non-page UI, plus login/logout, user validation, permission or access control, notification or toast integration, i18n integration, and live or auto-refreshing data. Also trigger on "Ginjou fetcher", "Ginjou controller", "wire Ginjou", "useList", "useCreate", "useEdit", or "useSelect".
---

# Using Ginjou

## Overview

Implement Ginjou in consumer applications by following the official integration model for the current stack. Treat the Ginjou source as the authority, and do not invent alternative provider wiring, route conventions, or controller flows unless the application already requires a custom abstraction.

## Quick Start

1. Identify the framework (Vue or Nuxt) and backend (REST, Supabase, Directus, or custom).
2. Match the task to the closest feature area below, then read the matching reference.
3. Register providers at the app root; skip any provider the app does not use.

## Common Tasks

- Setting up Ginjou providers or connecting a backend → [./references/setup.md](./references/setup.md)
- Loading lists, detail data, or select/autocomplete options → [./references/controllers.md](./references/controllers.md)
- Building standard create or edit form flows → [./references/forms.md](./references/forms.md)
- Running create, update, or delete actions in dialogs, buttons, widgets, or other custom UI → [./references/data-composables.md](./references/data-composables.md)
- Calling a custom or non-standard API endpoint outside the resource contract → [./references/data-composables.md](./references/data-composables.md)
- Adding login, logout, session checks, auth status checks, or user identity loading → [./references/authentication.md](./references/authentication.md)
- Adding permission checks, role-based UI, or access control → [./references/authorization.md](./references/authorization.md)
- Wiring toast or notification providers into Ginjou → [./references/notifications.md](./references/notifications.md)
- Wiring localization or i18n into Ginjou → [./references/i18n.md](./references/i18n.md)
- Adding realtime or live-updating lists → [./references/realtime.md](./references/realtime.md)

## Common User Phrasing

- "Build a login page" or "add sign in and sign out"
- "Make a table page for orders" or "show a list of users"
- "Create a new record form" or "edit an existing item"
- "Create, update, or delete a record from a modal, drawer, or button"
- "Build a select or autocomplete that loads remote options"
- "Check whether the current user is authenticated"
- "Hide the edit or delete button unless the user has permission"
- "Hook my toast or notification system into Ginjou"
- "Add vue-i18n or localization to Ginjou"
- "Make the list update by itself when data changes"
- "Connect Ginjou to Supabase, Directus, or a REST API"
- "Should I use `useList`, `useGetList`, or `useSelect`?"

## When to Use

- Installing or configuring Ginjou in a Vue or Nuxt app
- Wiring `define*Context` providers (`defineFetchersContext`, `defineQueryClientContext`, `defineAuthContext`, etc.)
- Building any Ginjou CRUD flow, even when it is not a page: list/detail fetching, create/update/delete mutations, dialogs, action buttons, widgets, or other custom UI
- Building select or autocomplete option-loading flows with `useSelect`
- Building login/logout flows, user validation, session checks, auth status checks, or identity loading
- Building permission checks, permission management, role-based UI, or access control with `useCanAccess` or `usePermissions`
- Wiring notifications or toast systems into Ginjou with `defineNotificationContext` or `useNotify`
- Wiring localization, translation, locale switching, or i18n into Ginjou with `defineI18nContext`, `useTranslate`, or `useLocale`
- Building realtime or live-updating pages, especially lists that refresh from server events
- Building form workflows for creating or editing records
- Choosing between page controllers and lower-level data composables
- Adding auth, authorization, notifications, realtime, or i18n via Ginjou

Do **not** use for modifying the Ginjou monorepo itself, or apps with no Ginjou fetcher.

## Reference Routing

| If the task is about | Read |
| --- | --- |
| Installation, root wiring, fetchers, SSR hydration, or framework setup | [./references/setup.md](./references/setup.md) |
| Optional resource definitions, nested routes, route-aware context, multiple fetchers | [./references/resources.md](./references/resources.md) |
| List data, infinite lists, detail data, select inputs, autocomplete, `useList`, `useInfiniteList`, `useShow`, or `useSelect` | [./references/controllers.md](./references/controllers.md) |
| Standard create forms, edit forms, delete confirmation flows, `useCreate`, `useEdit`, or `useDeleteOne` | [./references/forms.md](./references/forms.md) |
| Non-page CRUD actions, custom create/update/delete flows, dialogs, buttons, widgets, `useGetList`, `useGetOne`, `useGetMany`, `useCreateOne`, `useUpdateMany`, `useUpdateOne`, `useDeleteMany`, `useDeleteOne`, `useCustom`, `useCustomMutation`, error handling, or custom composition | [./references/data-composables.md](./references/data-composables.md) |
| Login, logout, user validation, session checks, identity, or auth error handling | [./references/authentication.md](./references/authentication.md) |
| Access control, permission checks, permission management, `useCanAccess`, or `usePermissions` | [./references/authorization.md](./references/authorization.md) |
| Toasts, notification providers, `useNotify`, progress messages, or undoable notifications | [./references/notifications.md](./references/notifications.md) |
| Live updates, realtime lists, subscriptions, or query invalidation from server events | [./references/realtime.md](./references/realtime.md) |
| I18n setup, localization, translation keys, locale switching, `useTranslate`, or `useLocale` | [./references/i18n.md](./references/i18n.md) |

## Decision Rules

- Vue apps use `@ginjou/vue`; add `defineRouterContext` (via `@ginjou/with-vue-router`) when router-aware behavior is required.
- Nuxt apps use `@ginjou/nuxt`; do not add `defineRouterContext`, and prefer async query/controller composables for SSR-backed views.
- If the backend is not specified, inspect existing dependencies, fetchers, and environment first. Do not guess between REST, Supabase, or Directus.
- Resources are optional. Use `defineResourceContext` only when route-aware resolution, navigation helpers, or per-resource fetcher binding are actually needed.
- For route-level page views that clearly follow standard CRUD behavior, use page controllers (`useList`, `useShow`, `useCreate`, `useEdit`). For select inputs, dialogs, widgets, delete buttons, or other non-page components, prefer `useSelect` or lower-level data composables. If you are not sure which applies, ask the user.
- Custom dashboards, batch operations, or non-standard route/ID sources should start with lower-level data composables.
- Default mutation flows to `pessimistic` unless the product explicitly needs optimistic or undoable behavior.
- `undoable` mutations require a notification provider.
- Realtime should default to auto invalidation unless the app needs event-specific side effects.
- Multi-backend apps should choose fetchers at the resource level with `meta.fetcherName`.

## Output Standards

- State which reference guided the implementation.
- Call out framework-specific constraints such as SSR or router integration.
- If controller use is ambiguous, ask the user instead of silently assuming CRUD automation is desired.
- If a detail is unclear, inspect the matching guide or package source before writing code.
