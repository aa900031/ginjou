# Svelte Setup

Use this reference for `@ginjou/svelte` (the Svelte 5 adapter). See the
[Svelte guide](https://ginjou.pages.dev/raw/integrations/svelte.md) for the full
walkthrough, and [behavior.md](./behavior.md) for the provider model.

**Composable names are identical to Vue** (`useList`, `useShow`, `useCreate`,
`useEdit`, `useGetList`, `useGetOne`, `useCreateOne`, `useUpdateOne`,
`useDeleteOne`, `useSelect`, `useGo`, `useNavigateTo`, …). Their options and
behavior live in the framework-agnostic `behavior.md` references — read those for
filters, sorters, mutation modes, redirect timing, etc. **Only the setup and
reactivity *shape* differs from Vue, and that difference is what this file
covers.** Do not copy Vue's `.value` / `<script setup>` syntax into Svelte.

## Installation

Svelte uses TanStack Query's Svelte build, not the Vue one.

```bash
pnpm add @ginjou/svelte @tanstack/svelte-query
```

Add a backend adapter as usual — they are framework-agnostic, so the same
`@ginjou/with-rest-api`, `@ginjou/with-supabase`, and `@ginjou/with-directus`
packages work here. For Svelte routing, `@ginjou/with-svelte-spa-router` binds
`svelte-spa-router` to the router contract.

## App Root Wiring

Register contexts once near the app root (e.g. `App.svelte`) via Svelte's
`setContext`, so every composable reads the same shared contexts. Two are
required for data: query client and fetchers.

```svelte
<script lang="ts">
import { defineFetchersContext, defineQueryClientContext } from '@ginjou/svelte'
import { createFetcher } from '@ginjou/with-rest-api'

const { children } = $props()

// Pass QueryClient options directly — the adapter constructs the client.
defineQueryClientContext({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
})

defineFetchersContext({
  default: createFetcher({ url: 'https://api.example.com' }),
})
</script>

{@render children()}
```

For a custom fetcher, use `defineFetcher` from `@ginjou/core` instead of a
backend adapter. Add router, auth, authz, notifications, realtime, i18n, and
resources contexts (`defineRouterContext`, `defineAuthContext`, …) at the same
root only when the app needs them — the context set matches Vue.

## Reactivity (runes)

`@ginjou/svelte` targets Svelte 5 and uses runes throughout. This changes how
you read results compared to Vue:

- Query/mutation results are reactive via signals. Read `.data`, `.isLoading`,
  `.isPending`, etc. **directly** in `$derived` or markup — no `.value`, no
  wrapping.
- Controller state fields (`currentPage`, `perPage`, `filters`, `sorters`,
  `search`) are plain reactive properties. Read and **assign them directly**;
  there is no `.value` and you do not need `setFilters`-style calls for simple
  assignment.
- **Do not destructure reactive fields** off a result (`const { data } = useGetOne()`).
  That captures a one-time snapshot and loses reactivity. Keep the returned
  object and read `query.data` / `list.records` / `mutation.isPending` off it.
  Stable methods (`mutate`, `mutateAsync`, `save`, `stop`) *can* be destructured.

This skill has a Svelte reference per feature, mirroring `vue.md` file-for-file
(`controllers/svelte.md`, `forms/svelte.md`, `data/svelte.md`,
`authentication/svelte.md`, `authorization/svelte.md`, `notifications/svelte.md`,
`realtime/svelte.md`, `i18n/svelte.md`, `resources/svelte.md`, `router/svelte.md`).
Open the one matching your feature for its Svelte example; it delegates shared
behavior to the matching `behavior.md` references.

```svelte
<script lang="ts">
import { useList } from '@ginjou/svelte'

const listPage = useList({ resource: 'posts' })

function nextPage() {
  listPage.currentPage += 1 // assign directly
}
</script>

{#each listPage.records as post (post.id)}
  <li>{post.title}</li>
{/each}
```

## Reactive props: `MaybeAccessor`

When a composable prop depends on reactive state, pass an **accessor function**
(`() => value`) instead of a bare value. Props are typed `MaybeAccessor<T>` —
they accept either a plain `T` or `() => T`. Use the function form so the
composable re-reads the value when it changes.

```svelte
<script lang="ts">
import { useGetOne } from '@ginjou/svelte'

const { id } = $props()

const postQuery = useGetOne(() => ({ resource: 'posts', id }))
</script>
```

## Rules

- Install `@ginjou/svelte` with `@tanstack/svelte-query` (the Svelte build).
- Register `defineQueryClientContext` and `defineFetchersContext` once at the app
  root; add other contexts only when needed.
- Read result/controller fields directly — no `.value`, no `<script setup>`.
- Assign controller state (`currentPage`, etc.) directly instead of porting Vue
  setter idioms verbatim.
- Pass an accessor function (`() => ({ … })`) for props that depend on reactive
  state.
- For composable options and behavior, read the matching `behavior.md` reference —
  the contracts are shared; only this file's syntax is Svelte-specific.
