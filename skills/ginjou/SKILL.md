---
name: ginjou
description: >-
  Use when building or modifying any Vue, Nuxt, or Svelte app with Ginjou
  (@ginjou/*) — admin panels, dashboards, data tables, storefronts, SaaS,
  internal tools, or a single list / show / create / edit page. Covers the whole
  surface: installing and wiring providers and backends (REST, Supabase,
  Directus); list / show / create / edit pages with useList / useShow /
  useCreate / useEdit; data fetching and mutations (useGetList, useGetOne,
  useCreateOne, useUpdateOne, useDeleteOne, useCustom); and authentication,
  authorization, notifications, undoable / optimistic mutations, realtime, i18n,
  route-aware resources, and Nuxt SSR. Reach for it whenever a Ginjou package is
  present, or a Vue / Nuxt / Svelte app needs data fetching, auth, notifications,
  realtime, i18n, or SSR — even if Ginjou is not named and even if the app is not
  a classic CRUD or admin tool.
license: MIT
metadata:
  author: zhong666
  version: "0.1.0"
---

# Using Ginjou

Ginjou is a headless CRUD/admin library for Vue, Nuxt, and Svelte; its core
(`@ginjou/core`) is framework-agnostic. The shape of every app is the same two
steps: **wire backend adapters and providers once at the app root**, then build
pages and widgets by **calling composables** in components. The composable
*names and options are identical across all three frameworks* — only the root
wiring and the reactivity *syntax* differ per framework.

## Guardrails (these prevent the most common mistakes)

- Ginjou has **no** `useQuery` or `useMutation`. The real composable names are in
  the Reference map below — use them verbatim.
- Don't invent hooks, packages, props, or backend `meta` fields. If a capability
  isn't in the matching reference file, treat it as **unconfirmed and say so**
  rather than guessing.
- There are official adapters for **Vue, Nuxt, and Svelte only**. No
  React/Solid/Angular adapter — `setup/behavior.md` covers building a custom one.

## How to use this skill

1. **Identify the framework** the app uses (Vue, Nuxt, or Svelte) — it's fixed
   for the whole task.
2. **Find the task row** in the Reference map and note its reference directory.
3. **Open `<dir>/<framework>.md`.** If the row's *Behavior* column is ✓, also
   open `<dir>/behavior.md` for the framework-agnostic model and rules. Rows
   without ✓ are self-contained — one file is enough.
4. **Then** write code, following the patterns and ⚠️ pitfalls in those files.
   Each reference carries its own exact install/wiring; don't recommend a pattern
   before reading the row's files.

## Reference map

One row per task. Paths are relative to `./references/`. A root provider you
register once (`define…Context`) is shown before a `·`, the composables you call
after it. Open `<dir>/vue.md` or `<dir>/svelte.md` for your framework; add
`<dir>/behavior.md` when *Behavior* is ✓.

| Task | Composable(s) | Reference dir | Behavior |
| --- | --- | --- | --- |
| **Install & wire root providers** | `defineQueryClientContext` / `defineFetchersContext` | `setup/` | ✓ |
| **Backend adapter** (REST / Supabase / Directus) | `createFetcher` | `backends/` | (framework-agnostic — see note) |
| **List page** (pagination, sort, filter) | `useList` | `controllers/` | ✓ |
| Infinite / load-more list | `useInfiniteList` | `controllers/` | ✓ |
| **Show / detail page** (reads `id` from route) | `useShow` | `controllers/` | ✓ |
| Select / autocomplete field (remote options) | `useSelect` | `controllers/` | ✓ |
| **Create page** (redirect after save) | `useCreate` | `forms/` | ✓ |
| **Edit page** (optimistic / undoable / pessimistic) | `useEdit` | `forms/` | ✓ |
| Read in a widget/dialog (not a page), incl. infinite scroll | `useGetList` / `useGetOne` / `useGetMany` / `useGetInfiniteList` | `data/` | ✓ |
| Create/update/delete outside a page | `useCreateOne` / `useUpdateOne` / `useDeleteOne` | `data/` | ✓ |
| Bulk create/update/delete | `useCreateMany` / `useUpdateMany` / `useDeleteMany` | `data/` | ✓ |
| Non-resource read / write | `useCustom` / `useCustomMutation` | `data/` | ✓ |
| Navigate (after save, breadcrumbs) | `defineRouterContext` · `useGo` / `useBack` / `useNavigateTo` | `router/` | ✓ |
| Routes ↔ resources, route inference | `defineControllerContext` · `useResource` / `useResourcePath` | `resources/` | ✓ |
| Authentication (login / logout / session) | `defineAuthContext` · `useLogin` / `useLogout` / `useAuthenticated` / `useGetIdentity` | `authentication/` | — |
| Authorization (access / permissions) | `defineAuthzContext` · `useCanAccess` / `usePermissions` | `authorization/` | — |
| Notifications | `defineNotificationContext` · `useNotify` | `notifications/` | — |
| Realtime | `defineRealtimeContext` · `useSubscribe` / `usePublish` | `realtime/` | — |
| i18n (translate / locale) | `defineI18nContext` · `useTranslate` / `useLocale` | `i18n/` | — |
| **Nuxt** module, SSR, async, auto-import boundary | `useAsyncList` / `useAsyncGetList` (every read composable has a `useAsync*` SSR twin) | `ssr/nuxt.md` + Vue leaves | (see note) |

## Reading the map

- **Two files for ✓ rows, one for the rest.** A ✓ row's behavior lives in
  `<dir>/behavior.md` (shared model + rules); open it alongside your framework
  leaf. A `—` row inlines everything into the framework leaf — one read suffices.
- **Backends are framework-agnostic.** Open the file under `backends/` directly
  (`rest-api.md`, `supabase.md`, `directus.md`); there is no vue/svelte split.
- **Nuxt** has no feature column of its own. Use the **Vue** leaf
  (`<dir>/vue.md`) for every feature, plus `setup/nuxt.md` and `router/nuxt.md`
  where they exist, plus `ssr/nuxt.md` for the `useAsync*` SSR twins.
- **Svelte mirrors Vue file-for-file** — same directories, `svelte.md` instead of
  `vue.md`.
- If a capability isn't in the matching reference, treat it as unconfirmed and
  say so; don't invent hooks, packages, props, or backend `meta` fields.
