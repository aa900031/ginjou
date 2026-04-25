---
name: ginjou
description: >
  Use when the developer works with Ginjou (@ginjou/*). In a Ginjou workspace,
  also use for CRUD dashboards, admin panels, data tables, forms, provider
  wiring, backend adapters, mutation modes, optimistic updates, undoable
  mutations, realtime subscriptions, authentication, authorization,
  notifications, i18n, route-aware resources, or SSR data fetching. Also
  triggers when asking about Ginjou compatibility with other frameworks.
---

# Using Ginjou

## Overview

Use this skill as a verified routing guide for Ginjou questions. Load the
smallest complete reference chain before answering, and do not invent provider
placement, router behavior, route inference, or adapter capabilities.

## Supported Framework Policy

Ginjou's core (`@ginjou/core`) is framework-agnostic. Adapters currently exist
for:

| Framework | Package | Status |
| --- | --- | --- |
| Vue 3 | `@ginjou/vue` | Supported |
| Nuxt 3/4 | `@ginjou/nuxt` (builds on `@ginjou/vue`) | Supported |
| React | - | Not available |
| Svelte | - | Not available |
| Solid | - | Not available |
| Angular | - | Not available |

When an unsupported framework is detected:

1. State that Ginjou currently provides Vue and Nuxt adapters only.
2. Explain that `@ginjou/core` is framework-agnostic and defines all contracts
  (fetcher, auth, router, resource, notification, realtime, i18n).
3. To use Ginjou with another framework, the developer must build a custom
  adapter that binds core contracts to that framework's context, state, and
  router model.
4. Do not invent hooks, packages, or API names for unsupported frameworks.
5. If the question is conceptual, answer using core architecture. If
  implementation-specific, outline what a custom adapter would need to
  implement.

Framework cues:

- **Vue**: `@ginjou/vue`, `defineXxxContext`, `useXxx`, `App.vue`, `script setup`, `vue-router`
- **Nuxt**: `@ginjou/nuxt`, `nuxt.config.ts`, `useAsync*`, auto-import, SSR, `app.vue`
- **Unsupported**: React, Next.js, Remix, Svelte, SvelteKit, Solid, Angular, or any `@ginjou/<framework>` that does not exist

## Generic CRUD Intake

When the prompt is generic CRUD or admin intent rather than explicit Ginjou API
usage:

1. Detect whether it spans more than one domain or UI surface.
2. For mutation flows, check whether notifications, undoable behavior, or backend rules add risk.
3. Then follow Routing Workflow below.

## Routing Workflow

1. Detect the problem domain: auth, authorization, router, i18n, realtime, or data+CRUD.
2. Detect framework cues. If an unsupported framework is detected, stop normal routing and follow the Supported Framework Policy above. Only treat a framework as unsupported when it is the primary Ginjou integration target, not when mentioned incidentally in a multi-framework context.
3. If no framework cue is present:
   - For conceptual questions, answer with core concepts first without defaulting to Vue or Nuxt.
   - For implementation questions, ask one clarifying question about framework (and backend if also unknown) before proceeding.
4. Detect the framework: Vue or Nuxt.
5. Detect the backend: REST API, Supabase, Directus, or mixed.
6. Detect the UI surface: standard page, option-loading field, router-only helper flow, or custom UI flow.
7. Detect whether the answer depends on route-derived resource, action, id, path resolution, or current location.
8. Load the smallest complete reference chain from the map below.
9. If adapter behavior changes safety or syntax, include backend-specific safety checks before recommending an implementation pattern.
10. If one branch remains ambiguous after routing, ask one minimal clarifying question. If both framework and backend are unknown, combine them into one question.
11. Keep the first response short when core routing context is missing, but do not skip safety checks already implied by the prompt.

## Reference Map

Only recommend capabilities documented in the matching reference. Type-level
existence without implementation confirmation is unverified.

Reference files are organized into three layers:

- `core/` - Framework-agnostic contracts, capabilities, and behavior models.
- `vue/` - Vue 3 adapter: composables, context setup, and reactive API.
- `nuxt/` - Nuxt 3/4 incremental layer: module setup, auto-imports, and SSR.

Load core references first, then add the framework layer only when setup or API
syntax is needed.

| Problem | Core reference | Vue reference | Nuxt reference | Why |
| --- | --- | --- | --- | --- |
| Provider model, backend selection, multi-backend | [core/setup.md](./references/core/setup.md) | [vue/setup.md](./references/vue/setup.md) | [nuxt/setup.md](./references/nuxt/setup.md) | Core defines the provider model; adapters define wiring. |
| Backend: REST API | [core/backend-rest-api.md](./references/core/backend-rest-api.md) | - | - | Adapter is framework-agnostic. |
| Backend: Supabase | [core/backend-supabase.md](./references/core/backend-supabase.md) | - | - | Adapter is framework-agnostic. |
| Backend: Directus | [core/backend-directus.md](./references/core/backend-directus.md) | - | - | Adapter is framework-agnostic. |
| Route mapping, resources, nested routes | [core/resources.md](./references/core/resources.md) | [vue/resources.md](./references/vue/resources.md) | - | Core defines resource model; Vue adds composables. |
| Navigation helpers, `keepQuery` / `keepHash` | [core/router.md](./references/core/router.md) | [vue/router.md](./references/vue/router.md) | [nuxt/router.md](./references/nuxt/router.md) | Core defines contract; adapters define hooks. |
| List, show pages, option-loading | [core/controllers.md](./references/core/controllers.md) | [vue/controllers.md](./references/vue/controllers.md) | - | Core defines patterns; Vue adds `useList`, `useSelect`, and related APIs. |
| Create, edit pages, mutation modes | [core/mutation-flows.md](./references/core/mutation-flows.md) | [vue/forms.md](./references/vue/forms.md) | - | Core defines flows; Vue adds `useCreate`, `useEdit`, and mutation ergonomics. |
| Non-page queries, mutations, widgets, dialogs | [core/data-flow.md](./references/core/data-flow.md) | [vue/data-composables.md](./references/vue/data-composables.md) | - | Core defines the model; Vue adds composables. |
| Auth lifecycle | [core/authentication.md](./references/core/authentication.md) | [vue/authentication.md](./references/vue/authentication.md) | - | Core defines the contract; Vue adds composables. |
| Access control | [core/authorization.md](./references/core/authorization.md) | [vue/authorization.md](./references/vue/authorization.md) | - | Core defines the contract. |
| Notification wiring, undoable | [core/notifications.md](./references/core/notifications.md) | [vue/notifications.md](./references/vue/notifications.md) | - | Core defines the contract. |
| Realtime subscriptions, fallback | [core/realtime.md](./references/core/realtime.md) | [vue/realtime.md](./references/vue/realtime.md) | - | Core defines the contract. |
| Translation, locale | [core/i18n.md](./references/core/i18n.md) | [vue/i18n.md](./references/vue/i18n.md) | - | Core defines the contract. |
| Nuxt SSR, async composables | - | - | [nuxt/ssr.md](./references/nuxt/ssr.md) | Nuxt-only incremental layer. |

## Reference Chains

| Situation | Read order | Guard rail |
| --- | --- | --- |
| Pure concept or architecture | matching core reference | Do not default to Vue or Nuxt unless setup or API syntax is required. |
| Vue implementation | matching core reference -> matching vue reference | Start from core contracts, then add Vue context setup or composable syntax. |
| Nuxt implementation | matching core reference -> matching vue reference -> matching nuxt reference | Nuxt is incremental on top of Vue, so do not skip the Vue layer. |
| Unsupported framework | matching core reference -> Supported Framework Policy | Use core architecture plus custom-adapter guidance without inventing framework APIs. |

## Core Guard Rails

- In the first sentence, name the most likely Ginjou pattern or reference path.
- Do not default to Vue when framework is unspecified. Answer with core concepts first.
- If one routing branch is still ambiguous, ask one minimal clarifying question; combine framework and backend only when both are needed for implementation guidance.
- Separate standard CRUD pages, option-loading fields, router-only helpers, and custom UI flows before naming APIs.
- Load core references first. Add Vue only when reactive API or context setup matters. Add Nuxt only when module setup, auto-imports, or SSR behavior matters.
- Do not invent hooks, packages, or setup patterns for unsupported frameworks.
- Nuxt is an incremental layer on top of Vue, not a separate framework branch.
- Include backend-specific safety or capability checks before recommending syntax when adapter behavior changes the answer.
- Do not infer backend meta fields across adapters or promise undocumented capabilities.
- Do not assume provider wiring belongs in feature pages.
- Do not assume route or resource inference exists without registered resources.
- Do not assume realtime transport exists, undoable UX works without notifications, or `useLocale` works with a partial i18n context.
- In Nuxt, only assume documented auto-imports. `useGo`, `useBack`, `useLocation`, and `useResolvePath` require explicit imports.

## Answer Contract

Every answer should:

1. Name the reference file or files used and why each one was needed.
2. State the hard prerequisite or boundary, such as root setup, route mapping, notification wiring, locale completeness, or transport availability.
3. Include backend-specific safety output before recommending a pattern when adapter behavior matters.
4. Provide a fallback when the required capability is unavailable or unconfirmed.
5. When an unsupported framework is in scope, follow the Supported Framework Policy: state Vue/Nuxt-only status, explain core is framework-agnostic, and never fabricate non-existent hooks or packages.
6. Ask at most one clarifying question, and only after the routing chain and current safety boundaries are already clear.
