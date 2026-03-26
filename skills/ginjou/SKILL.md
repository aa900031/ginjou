---
name: ginjou
description: Use when building or modifying a Vue or Nuxt application that installs, configures, or implements Ginjou resources, controllers, data composables, authentication, authorization, notifications, or realtime features.
---

# Ginjou Application

## Overview

Implement Ginjou in consumer applications by following the official Vue and Nuxt integration model. Treat the Ginjou docs and source as the authority, and do not invent alternative provider wiring, resource conventions, or controller flows unless the application already requires a custom abstraction.

## Use This Skill For

- Installing Ginjou in Vue or Nuxt apps
- Wiring root-level `define*Context` providers
- Defining resources and route mappings
- Building list, show, create, and edit flows
- Choosing between controllers and lower-level data composables
- Adding authentication, authorization, notifications, or realtime

Do not use this skill to change Ginjou's monorepo internals or to write upstream package documentation.

## Workflow

1. Inspect the app framework, router, existing provider setup, and backend choice.
2. Pick the dominant task type from the routing table below and read that reference before editing code.
3. Prefer high-level controllers when they match the page flow. Drop to data composables only when the app needs custom routing, mutation timing, or query composition.
4. Register providers only at the app root: `App.vue` for Vue, `app.vue` or `app/app.vue` for Nuxt.
5. Keep resource definitions aligned with real route patterns so `useResource`, navigation helpers, and ID resolution stay correct.

## Reference Routing

| If the task is about | Read |
| --- | --- |
| Installation, root wiring, fetchers, framework setup | [references/setup.md](references/setup.md) |
| Resource definitions, nested routes, multiple fetchers | [references/resources.md](references/resources.md) |
| `useList`, `useInfiniteList`, `useShow`, or page-level list/detail flows | [references/controllers.md](references/controllers.md) |
| `useCreate`, `useEdit`, `useDeleteOne`, or mutation-driven form flows | [references/forms.md](references/forms.md) |
| `useGetList`, `useGetOne`, `useGetMany`, `useCreateOne`, `useUpdateMany`, or custom composition | [references/data-composables.md](references/data-composables.md) |
| Authentication, authorization, notifications, or realtime | [references/providers.md](references/providers.md) |

## Decision Rules

- Vue apps use `@ginjou/vue`; add `defineRouterContext` when router-aware behavior is required.
- Nuxt apps use `@ginjou/nuxt`; do not add `defineRouterContext`, and prefer async query/controller composables for SSR-backed views.
- If the backend is not specified, inspect existing dependencies, fetchers, and environment first. Do not guess between REST, Supabase, or Directus.
- Standard CRUD pages should start with controllers.
- Custom dashboards, batch operations, or non-standard route/ID sources should start with lower-level data composables.
- Default mutation flows to `pessimistic` unless the product explicitly needs optimistic or undoable behavior.
- `undoable` mutations require a notification provider.
- Realtime should default to auto invalidation unless the app needs event-specific side effects.
- Multi-backend apps should choose fetchers at the resource level with `meta.fetcherName`.

## Output Standards

- State which reference guided the implementation.
- Call out framework-specific constraints such as SSR or router integration.
- If a detail is unclear, inspect the matching guide or package source before writing code.
