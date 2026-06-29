# Core Setup

## Provider Model

Ginjou uses a **provider model**: feature code calls shared contracts (fetcher, auth, router, etc.) without knowing which adapter implements them. Register adapters once at the app boundary; feature code stays adapter-agnostic.

Official framework adapters exist only for **Vue** (`@ginjou/vue`), **Nuxt** (`@ginjou/nuxt`), and **Svelte** (`@ginjou/svelte`). There is **no adapter for React, Solid, Angular, or any other framework** — `@ginjou/core` is framework-agnostic, so supporting one means writing a custom adapter that binds the core contracts (fetcher, auth, router, resource, notification, realtime, i18n) to that framework's reactivity. Don't assume hooks or packages exist for an unsupported framework.

## Required And Optional Contexts

At least one fetcher contract is required for data operations. Add everything else only when the app actually needs that capability.

| Capability | Required | When it matters |
| --- | --- | --- |
| Data fetcher | Yes | All CRUD and custom data flows need a fetcher. |
| Auth | No | Login, logout, identity, or session checks. |
| Authorization | No | Permission checks and access control. |
| Router | No | Navigation, route sync, or current-location-aware behavior. |
| Resources | No | Route-derived `resource` / `id` / `action`, action-based navigation, breadcrumbs, nested hierarchies. |
| I18n | No | Translation or locale-aware behavior. |
| Notifications | No | Toasts, progress feedback, or undoable flows. |
| Realtime | No | Subscription, publish, or live-refresh behavior. |

Adapter-specific query-client wiring stays in [Vue](https://ginjou.pages.dev/raw/integrations/vue.md) and is not part of the core contract.

## Multi-Backend Boundary

Multi-backend setup is a two-step boundary:

1. Register named fetchers at the app boundary.
2. Bind each resource to one fetcher with resource metadata.

`meta.fetcherName` selects which named fetcher serves that resource. It does not
normalize backend-specific request syntax. Once the fetcher is selected, keep
using the matching backend reference for query and auth rules.

If a resource is not bound explicitly, the default fetcher remains the normal
fallback.

## Backend Selection Principles

Choose the backend adapter by the backend contract you need, not by page shape.

| Backend | Choose it when | Keep in mind | Next reference |
| --- | --- | --- | --- |
| REST API | The backend is a generic or custom HTTP API, or the app needs custom headers, methods, or client wiring. | Auth and other non-fetcher capabilities are separate contracts. | [backend-rest-api.md](./backend-rest-api.md) |
| Supabase | The backend is Supabase, or the task depends on Postgrest `select`, `count`, or custom id-column mapping. | The official adapter has built-in auth support but does not implement `custom`. | [backend-supabase.md](./backend-supabase.md) |
| Directus | The backend is Directus, or the task depends on Directus query fields, filters, or aggregate-driven list totals. | The adapter supports Directus-specific query metadata and `custom`. | [backend-directus.md](./backend-directus.md) |

When the app mixes backends, keep one fetcher per backend and bind resources
explicitly instead of trying to merge adapter-specific `meta` rules into one
shared shape.

## Rules

- Register shared contracts at the application boundary, not inside feature pages.
- Always provide at least one fetcher before modeling data flows.
- Treat multi-backend setup as two steps: named fetchers first, resource binding second.
- Keep backend-specific `meta` syntax inside the matching backend reference.
- Add router and resource contracts only when the app needs route-aware behavior.
- Add notification capability before promising undoable UX.
