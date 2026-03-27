---
name: ginjou
description: Use when the user is working with Ginjou (@ginjou/vue, @ginjou/nuxt) or building a Ginjou-powered admin panel. Trigger for installing or wiring Ginjou providers, building list/detail/form pages, auth flows, or realtime sync using Ginjou composables. Also trigger on "Ginjou fetcher", "Ginjou controller", or "wire Ginjou".
---

# Ginjou

## Overview

Implement Ginjou in consumer applications by following the official integration model for the current stack. Treat the Ginjou docs and source as the authority, and do not invent alternative provider wiring, route conventions, or controller flows unless the application already requires a custom abstraction.

## Quick Start

1. Identify the framework (Vue or Nuxt) and backend (REST, Supabase, Directus, or custom).
2. Find the matching row in the Reference Routing table and read that reference.
3. Register providers at the app root; skip any provider the app does not use.

## When to Use

Use this skill when:
- Installing or configuring Ginjou in a Vue or Nuxt app
- Wiring root-level `define*Context` providers
- Building list, detail, create, or edit pages backed by Ginjou data
- Choosing between page controllers and lower-level composables
- Adding authentication, authorization, notifications, or realtime

Do **not** use this skill for:
- Modifying Ginjou's own monorepo packages or writing upstream documentation
- Apps that have no connection to a Ginjou fetcher (pure Vue/Nuxt with no Ginjou integration)

## Workflow

1. Inspect the app framework, router, existing provider setup, backend choice, and whether route-to-resource binding is needed at all.
2. Pick the dominant task type from the routing table below and read that reference before editing code.
3. For clearly CRUD page flows, consult the controllers or forms reference. When in doubt, ask rather than assume.
4. Register providers only at the app root: `App.vue` for Vue, `app.vue` or `app/app.vue` for Nuxt.
5. Bring in resource definitions only when route patterns, navigation helpers, route-derived IDs, or per-resource fetcher binding require them.

## Reference Routing

| If the task is about | Read |
| --- | --- |
| Installation, root wiring, fetchers, SSR hydration, or framework setup | [references/setup.md](references/setup.md) |
| Optional resource definitions, nested routes, route-aware context, multiple fetchers | [references/resources.md](references/resources.md) |
| `useList`, `useInfiniteList`, `useShow`, `useSelect`, or clearly CRUD page-level list/detail flows | [references/controllers.md](references/controllers.md) |
| `useCreate`, `useEdit`, `useDeleteOne`, or clearly CRUD mutation-driven form flows | [references/forms.md](references/forms.md) |
| `useGetList`, `useGetOne`, `useGetMany`, `useCreateOne`, `useUpdateMany`, `useUpdateOne`, `useDeleteMany`, `useDeleteOne`, error handling, or custom composition | [references/data-composables.md](references/data-composables.md) |
| Login, session checks, identity, or auth error handling | [references/authentication.md](references/authentication.md) |
| Access control, permission checks, `useCanAccess`, or `usePermissions` | [references/authorization.md](references/authorization.md) |
| Toasts, progress messages, or undoable notifications | [references/notifications.md](references/notifications.md) |
| Live updates, subscriptions, or query invalidation from server events | [references/realtime.md](references/realtime.md) |
| I18n setup, translation keys, locale switching | [references/i18n.md](references/i18n.md) |

## Decision Rules

- Vue apps use `@ginjou/vue`; add `defineRouterContext` when router-aware behavior is required.
- Nuxt apps use `@ginjou/nuxt`; do not add `defineRouterContext`, and prefer async query/controller composables for SSR-backed views.
- If the backend is not specified, inspect existing dependencies, fetchers, and environment first. Do not guess between REST, Supabase, or Directus.
- Resources are optional. Use `defineResourceContext` only when route-aware resolution, navigation helpers, or per-resource fetcher binding are actually needed.
- For route-level page views that clearly match CRUD behavior, use page controllers (`useList`, `useShow`, `useCreate`, `useEdit`). For sub-components, widgets, or non-page components, prefer lower-level data composables. If you are not sure which applies, ask the user.
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
