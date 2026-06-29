---
name: ginjou
description: >-
  Use when building or modifying CRUD apps with Ginjou (@ginjou/*) — admin
  panels, dashboards, data tables, or any list / show / create / edit page. Use
  it to install Ginjou into a project, wire providers and backends (REST,
  Supabase, Directus), build pages with useList / useShow / useCreate / useEdit,
  read or mutate data with composables (useGetList, useGetOne, useCreateOne,
  useUpdateOne, useDeleteOne), and set up auth, authorization, notifications,
  undoable / optimistic mutations, realtime, i18n, route-aware resources, or
  Nuxt SSR. Reach for this skill whenever a Ginjou package is present or the
  task is CRUD/admin work in a Ginjou project, even if Ginjou is not named.
license: MIT
metadata:
  author: zhong666
  version: "0.2.0"
---

# Using Ginjou

Ginjou is a headless CRUD/admin library for Vue, Nuxt, and Svelte (its core is
framework-agnostic). You wire backend adapters once at the app root, then build
pages and widgets with composables. Use the composables below verbatim — Ginjou
has **no** `useQuery` or `useMutation`; the real names are listed in the tables.

The composable names and their options are **the same across all adapters**;
only setup wiring and reactivity *syntax* differ per framework. This file routes
you to references via the **Reference map** below; the framework-specific code
lives in those references, not here.

## Reference map

One row per task. Each row names the composable(s) and the exact reference file
to open — per framework, plus the framework-agnostic behavior file. Open the
column for your framework **and** the behavior file. Paths are relative to
`./references/`. In the Composable(s) column, a root provider you register once
(`define…Context`) is shown before a `·`, and the composables you call in
components after it.

| Task | Composable(s) | Vue / Nuxt | Svelte | Behavior (core) |
| --- | --- | --- | --- | --- |
| **Install & wire root providers** | `defineQueryClientContext` / `defineFetchersContext` | `vue/setup.md` | `svelte/setup.md` | `core/setup.md` |
| **Backend adapter** (REST / Supabase / Directus) | `createFetcher` | — | — | `core/backend-rest-api.md` · `core/backend-supabase.md` · `core/backend-directus.md` |
| **List page** (pagination, sort, filter) | `useList` | `vue/controllers.md` | `svelte/controllers.md` | `core/controllers.md` |
| Infinite / load-more list **(page controller)** | `useInfiniteList` | `vue/controllers.md` | `svelte/controllers.md` | `core/controllers.md` |
| **Show / detail page** (reads `id` from route) | `useShow` | `vue/controllers.md` | `svelte/controllers.md` | `core/controllers.md` |
| Select / autocomplete field (remote options) | `useSelect` | `vue/controllers.md` | `svelte/controllers.md` | `core/controllers.md` |
| **Create page** (redirect after save) | `useCreate` | `vue/forms.md` | `svelte/forms.md` | `core/mutation-flows.md` |
| **Edit page** (optimistic / undoable / pessimistic) | `useEdit` | `vue/forms.md` | `svelte/forms.md` | `core/mutation-flows.md` |
| Read in a widget/dialog (not a page), incl. infinite scroll | `useGetList` / `useGetOne` / `useGetMany` / `useGetInfiniteList` | `vue/data-composables.md` | `svelte/data-composables.md` | `core/data-flow.md` |
| Create/update/delete outside a page | `useCreateOne` / `useUpdateOne` / `useDeleteOne` | `vue/data-composables.md` | `svelte/data-composables.md` | `core/data-flow.md` |
| Bulk create/update/delete | `useCreateMany` / `useUpdateMany` / `useDeleteMany` | `vue/data-composables.md` | `svelte/data-composables.md` | `core/data-flow.md` |
| Non-resource read / write | `useCustom` / `useCustomMutation` | `vue/data-composables.md` | `svelte/data-composables.md` | `core/data-flow.md` |
| Navigate (after save, breadcrumbs) | `defineRouterContext` · `useGo` / `useBack` / `useNavigateTo` | `vue/router.md` | `svelte/router.md` | `core/router.md` |
| Routes ↔ resources, route inference | `defineControllerContext` · `useResource` / `useResourcePath` | `vue/resources.md` | `svelte/resources.md` | `core/resources.md` |
| Authentication (login / logout / session) | `defineAuthContext` · `useLogin` / `useLogout` / `useAuthenticated` / `useGetIdentity` | `vue/authentication.md` | `svelte/authentication.md` | `core/authentication.md` |
| Authorization (access / permissions) | `defineAuthzContext` · `useCanAccess` / `usePermissions` | `vue/authorization.md` | `svelte/authorization.md` | `core/authorization.md` |
| Notifications | `defineNotificationContext` · `useNotify` | `vue/notifications.md` | `svelte/notifications.md` | `core/notifications.md` |
| Realtime | `defineRealtimeContext` · `useSubscribe` / `usePublish` | `vue/realtime.md` | `svelte/realtime.md` | `core/realtime.md` |
| i18n (translate / locale) | `defineI18nContext` · `useTranslate` / `useLocale` | `vue/i18n.md` | `svelte/i18n.md` | `core/i18n.md` |
| **Nuxt** module, SSR, async, auto-import boundary | `useAsyncList` / `useAsyncGetList` (every composable has a `useAsync*` SSR twin) | `nuxt/setup.md` · `nuxt/router.md` · `nuxt/ssr.md` | — | — |

Reading the map: only Vue, Nuxt, and Svelte have adapters. **Nuxt** has no
feature column of its own — use the **Vue / Nuxt** column for every feature, plus
the Nuxt row. **Svelte** mirrors Vue file-for-file. (No React/Solid/Angular
adapter — `core/setup.md` covers building a custom one.)

Each reference carries its own ⚠️ pitfalls and exact install/wiring — open the
row's files before recommending a pattern. If a capability isn't in the matching
reference, treat it as unconfirmed and say so; don't invent hooks, packages,
props, or backend `meta` fields.
