---
name: ginjou
description: >
  Use when a developer is integrating Ginjou in Vue or Nuxt and needs guidance on
  provider wiring, backend selection, route-aware resources, multi-backend binding,
  page controllers versus non-page data composables, undoable prerequisites,
  realtime fallback, auth or authorization, or backend-specific REST API,
  Supabase, or Directus meta and auth behavior. Trigger on mentions of
  @ginjou/*, define*Context, meta.fetcherName, useSelect, useEdit,
  useDeleteOne, useCanAccess, useNotify, useLogin, useLogout, or Nuxt useAsync*
  patterns.
---

# Using Ginjou

## Overview

Use this skill as a routing-first guide for Ginjou usage work.

Load the matching reference files before answering. Do not invent provider placement, API shapes, route inference rules, or backend adapter behavior from memory.

## Routing Workflow

1. Detect the framework: Vue or Nuxt.
2. Detect the backend: REST API, Supabase, Directus, or mixed.
3. Detect the UI surface: standard CRUD page, option-loading field, or custom UI flow such as dialogs, widgets, row actions, and side panels.
4. Detect whether the answer depends on route-derived resource, action, or id.
5. Load the smallest complete reference chain from the map below.
6. If backend details affect safety or syntax, include an adapter-specific check before recommending an implementation pattern.
7. If one branch is still ambiguous after routing, ask one minimal clarifying question.

## Trigger Cues

Use this skill when the request mentions one or more of these Ginjou-specific problems:

- provider registration, app-root wiring, or moving setup out of feature pages
- backend choice or backend-specific syntax for REST API, Supabase, or Directus
- named fetchers, per-resource backend binding, or meta.fetcherName
- route-derived resource or id inference, nested resources, or route metadata
- choosing between useList, useShow, useCreate, useEdit, useSelect, or lower-level data composables
- delete confirmation modals, inline side panels, dashboard widgets, or other non-page mutation flows
- undoable mutations, notification prerequisites, or missing toast or feedback wiring
- realtime subscriptions, missing transport, polling fallback, or manual refresh strategy
- Supabase auth types, Directus aggregate or groupBy, REST custom headers, or custom client wiring
- Ginjou auth, authorization, i18n, or permissions surfaces

## Reference Map

| Problem | Read | Why |
| --- | --- | --- |
| App root setup, provider registration, Vue or Nuxt split, SSR read composables | [setup.md](./references/setup.md) | Root wiring and framework rules live here. |
| Backend choice or backend-specific capability questions | [setup.md](./references/setup.md), then the matching backend reference | Setup defines the root boundary; adapter docs define supported syntax and auth behavior. |
| REST custom client, headers, or method overrides | [backend-rest-api.md](./references/backend-rest-api.md) | REST-specific meta and client rules are adapter-specific. |
| Supabase select, count, id mapping, or auth types | [backend-supabase.md](./references/backend-supabase.md) | Supabase-specific meta and login types live here. |
| Directus query fields, filters, aggregate, groupBy, or auth types | [backend-directus.md](./references/backend-directus.md) | Directus-specific query syntax and aggregation rules live here. |
| Route mapping, nested resources, route-aware inference, or meta.fetcherName | [resources.md](./references/resources.md) | Route metadata and per-resource backend binding live here. |
| Standard read-side pages and option-loading fields | [controllers.md](./references/controllers.md) | Page controllers and useSelect patterns live here. |
| Standard create and edit pages | [forms.md](./references/forms.md) | Page-level mutation flows and mutation modes live here. |
| Non-page queries or mutations, widgets, dialogs, row actions, or side panels | [data-composables.md](./references/data-composables.md) | Custom UI data flows belong here. |
| Login, logout, identity, or session lifecycle | [authentication.md](./references/authentication.md) | Shared auth lifecycle surface lives here. |
| Access control or permission checks | [authorization.md](./references/authorization.md) | Authorization rules live here. |
| Notification provider wiring or undoable prerequisites | [notifications.md](./references/notifications.md) | Undoable requires feedback infrastructure. |
| Realtime subscriptions or fallback refresh strategy | [realtime.md](./references/realtime.md) | Transport assumptions and fallback behavior live here. |
| Translation and locale integration | [i18n.md](./references/i18n.md) | I18n wiring and locale helpers live here. |

## Reference Chains

Use these chains for the most common problem families.

| Situation | Read order | Guard rail |
| --- | --- | --- |
| Pure backend comparison with no setup, SSR, or root-wiring context | matching backend references | Do not add setup unless the user is also asking about integration boundaries. |
| Backend package choice during setup or integration | setup -> matching backend references | Setup defines the root boundary; backend refs define supported capabilities. |
| Fresh project, app-root refactor, or provider placement | setup -> matching backend reference when adapter details matter | Root placement is deterministic; feature-page wiring is an anti-pattern. |
| Vue root wiring with router-aware admin state | setup -> resources when the same prompt depends on route-derived context | Decide provider placement first; add route-aware metadata only when the state actually depends on routing. |
| Multi-backend app, SSR setup, or per-resource backend binding | setup -> resources -> matching backend references | Register named fetchers first, then bind resources with meta.fetcherName. |
| Route-derived detail or edit flows | resources -> controllers or forms -> matching backend reference when id compatibility matters | Route inference requires registered resource metadata and adapter-compatible ids. |
| Remote select or autocomplete fields | controllers -> matching backend reference | Treat this as option loading, not a normal resource list page. |
| Row actions, confirmation modals, widgets, or inline side panels | data-composables -> matching backend reference | Non-page flows should not default to page CRUD controllers. |
| Undoable save or delete flows | notifications -> forms or data-composables -> matching backend reference | Do not recommend undoable before feedback wiring exists. |
| Live refresh, missing transport, polling, or manual refetch | realtime -> controllers or data-composables when the read surface matters -> matching backend reference | If the read surface is still unknown, give the fallback strategy first, then name the downstream read reference that will own the refetch wiring. |
| Supabase or Directus auth-method questions | matching backend reference -> authentication | Adapter docs define payload shapes; auth docs define lifecycle usage. |
| Directus dashboard aggregates or grouped summaries | backend-directus -> data-composables | Keep aggregate and groupBy inside Directus meta options. |

## High-Frequency Guard Rails

- Remote select and autocomplete work is option loading, not a normal resource list page. Read [controllers.md](./references/controllers.md) first, then the active backend reference, and keep the selected value separate from the current search results.
- Row actions, confirmation modals, dashboard widgets, and inline side panels are non-page flows. Read [data-composables.md](./references/data-composables.md) first, then run one backend safety check before recommending a mutation pattern.
- Undoable requests start with [notifications.md](./references/notifications.md). Do not recommend undoable unless feedback wiring already exists; otherwise give a safer fallback.
- Realtime or auto-refresh requests start with [realtime.md](./references/realtime.md). If transport is not confirmed for the active resource or surface, answer with fallback behavior instead of promising subscriptions.
- Root wiring requests always decide provider placement first, then router-aware integration second. In Vue, App.vue is the provider boundary; router context is an extra step only when route-aware behavior is needed.
- When fallback strategy is the only thing asked, still provide a concrete polling, manual-refresh, or hybrid recommendation before asking about the exact UI surface.

## Backend Capability Checkpoints

Use this table when the user is comparing backends or asking which adapter supports a concrete feature.

| Need | Adapter to inspect first | Concrete checkpoint |
| --- | --- | --- |
| Custom HTTP headers, custom client, or method overrides | [backend-rest-api.md](./references/backend-rest-api.md) | Keep client and header customization inside the REST adapter contract. Do not assume a built-in REST auth adapter exists. |
| Relation selects, exact counts, or custom id column mapping | [backend-supabase.md](./references/backend-supabase.md) | Use meta.select, add meta.count only when totals matter, and check idColumnName when id mapping differs. |
| Field selection, filters, aggregate, or groupBy | [backend-directus.md](./references/backend-directus.md) | Keep fields and filters inside meta.query, and keep grouped summaries inside meta.aggregate and meta.groupBy. |
| Built-in auth adapter support | [backend-supabase.md](./references/backend-supabase.md) or [backend-directus.md](./references/backend-directus.md) | Supabase and Directus define adapter auth behavior; REST should use a custom auth provider unless the project adds its own abstraction. |

## UI Pattern Quick Rules

Use these rules when the user is choosing between controllers and lower-level data operations.

| Surface | Preferred tool | Guard rail |
| --- | --- | --- |
| Standard list, show, create, or edit page | [controllers.md](./references/controllers.md) and [forms.md](./references/forms.md) | Use page-level controllers only when the flow follows standard page CRUD behavior. |
| Remote select or autocomplete field | [controllers.md](./references/controllers.md) with useSelect | Treat option loading separately from list pages and preserve the current selection outside the latest result set. |
| Modal, drawer, row action, widget, or inline side panel | [data-composables.md](./references/data-composables.md) | Do not default to page controllers for custom UI mutation flows. |
| Undoable action | [notifications.md](./references/notifications.md) plus the owning page or custom UI reference | If notification wiring is missing, recommend pessimistic or manual confirmation instead of undoable. |

## Operational Answer Patterns

Use these short patterns when the prompt is already specific and the answer needs concrete direction, not only routing.

- Root wiring: place providers at App.vue in Vue and app.vue in Nuxt. Treat router-aware integration as a second decision, not the provider boundary itself.
- Vue root wiring with route-aware state: move providers to App.vue first, then add resources or documented router integration only when the same flow depends on route-derived context.
- Supabase data questions: mention meta.select for fields and relations, meta.count when exact totals are needed, and idColumnName when id mapping differs from the default.
- Directus data questions: mention meta.query.fields and meta.query.filter for reads, and meta.aggregate plus meta.groupBy for grouped summaries.
- REST customization questions: keep custom headers, custom client wiring, and method overrides inside the REST adapter contract, and avoid implying a built-in REST auth adapter.
- Route-driven detail or edit questions: state that route inference depends on registered resource metadata; if that mapping is absent, pass resource and id explicitly.
- Option-loading questions: prefer useSelect, not useList, and keep the selected value independent from the current fetched options.
- Non-page mutation questions: prefer data composables, validate adapter-specific mutation constraints, and default to pessimistic mode when guarantees are unclear.
- Realtime fallback questions: state the transport assumption first, then choose polling, manual refresh, or hybrid behavior with a concrete cadence when polling is used.
- Surface-unspecified fallback questions: give the cadence and UX fallback first, then note that list pages attach refetching through [controllers.md](./references/controllers.md) while widgets and dialogs attach it through [data-composables.md](./references/data-composables.md).

## Decision Rules

### Framework and Root Setup

- For pure backend comparison questions with no setup or root-wiring cues, skip [setup.md](./references/setup.md) and go straight to the matching backend references.
- Vue uses [setup.md](./references/setup.md). If route-aware behavior is required, add router integration only through the documented Vue path.
- Nuxt uses [setup.md](./references/setup.md). Do not add Vue router context manually, and prefer documented useAsync* read-side composables for SSR-backed views.
- Root provider placement is deterministic: use App.vue in Vue and app.vue in Nuxt. Do not keep provider wiring inside feature pages.
- For Vue root-wiring questions, separate provider placement from router-aware setup: place providers at App.vue first, then add router integration only if the flow depends on route-aware behavior.
- If the same Vue root-wiring prompt also depends on route-derived resource or action state, add [resources.md](./references/resources.md) after setup and make the two-step boundary explicit.

### Surface Selection

- Standard list, show, create, and edit pages use [controllers.md](./references/controllers.md) and [forms.md](./references/forms.md).
- Select and autocomplete fields use [controllers.md](./references/controllers.md) and should prefer useSelect.
- Option-loading fields should preserve the current selection outside the latest fetched result set.
- Dialogs, widgets, row actions, inline side panels, and custom endpoints use [data-composables.md](./references/data-composables.md).
- If the dominant surface is unclear, ask whether the flow is page-driven or custom UI-driven.

### Route and Resource Dependence

- Load [resources.md](./references/resources.md) whenever the answer depends on route-derived resource, action, id, nested routes, or meta.fetcherName.
- If route metadata is registered and the action matches, page flows can infer resource context.
- If route metadata is missing, pass resource and id explicitly instead of assuming inference.

### Backend Selection and Source Boundaries

- Do not answer backend-specific syntax from generic guides.
- REST API customization comes from [backend-rest-api.md](./references/backend-rest-api.md).
- Supabase select, count, id mapping, and login types come from [backend-supabase.md](./references/backend-supabase.md).
- Directus query syntax, aggregate, groupBy, and login types come from [backend-directus.md](./references/backend-directus.md).
- If the backend is unspecified and that changes safety or syntax, provide a compact adapter triage block before recommending a concrete implementation.

### Routing Depth and Safety

- For backend-specific or route-dependent questions, use at least two layers when both are relevant: a setup or resources boundary plus the backend or behavior reference that carries the concrete rules.
- Before recommending option loading, non-page mutation, or undoable patterns, confirm the backend identity or provide the triage block below.

### Multi-Backend Binding

- Multi-backend apps are always two-step: register named fetchers during setup, then bind each resource with meta.fetcherName.
- When SSR is involved, keep the order explicit: root provider registration, named fetcher registration, resource binding, SSR read composables, then backend-specific meta or auth details.

### Undoable and Realtime Prerequisites

- undoable requires a notification provider from [notifications.md](./references/notifications.md).
- If mutation guarantees are uncertain, recommend pessimistic mode first.
- Realtime provider wiring does not create backend transport. If transport is unavailable or unconfirmed, route to fallback behavior from [realtime.md](./references/realtime.md).

## Backend Safety Checks

Run one of these checks before recommending a UI pattern when backend behavior matters.

| Problem type | REST API check | Supabase check | Directus check |
| --- | --- | --- | --- |
| Option loading or autocomplete | Confirm the project's search and filter contract and any documented pagination or sorting params before describing the query shape. | Keep option loading inside documented meta.select behavior and use meta.count only when total count is actually needed. | Keep option loading inside documented meta.query.fields and meta.query.filter behavior. |
| Non-page create, update, or delete flows | Confirm endpoint path, HTTP method, headers, and error contract before choosing mutation mode. | Confirm id mapping, including idColumnName when needed, and avoid undocumented meta fields. | Confirm collection and query shape plus any permission-sensitive fields before mutation execution. |
| Route-derived detail or edit flows | Confirm the route id matches the endpoint path contract. | Confirm route id compatibility with documented id mapping behavior. | Confirm route id matches the collection and query expectations. |
| Realtime fallback decisions | Treat no transport as the default unless a concrete transport is confirmed for this resource or surface. | Check transport availability per resource or surface; otherwise fall back to polling or manual refresh. | Check transport availability per resource or surface; otherwise fall back to polling or manual refresh. |

## Unknown-Backend Triage

When the backend is not specified and the answer depends on adapter behavior, do not stop at "backend unknown". Give a compact triage block first.

- For option-loading fields:
  - REST API: confirm the search and filter query contract used by the project.
  - Supabase: use meta.select for option fields and add meta.count only when pagination totals are required.
  - Directus: use meta.query.fields for option fields and meta.query.filter for typed search.
- For non-page mutation flows:
  - REST API: confirm endpoint path, method, headers, and error handling contract.
  - Supabase: confirm id mapping and stay inside documented meta fields.
  - Directus: confirm collection, query shape, and permission-sensitive fields.
- For route-driven detail or edit flows:
  - REST API: confirm the route id matches the endpoint path contract.
  - Supabase: confirm id compatibility, including idColumnName when needed.
  - Directus: confirm the route id matches the collection and query expectations.
- For live-refresh questions:
  - Start from fallback behavior unless transport is explicitly confirmed for the active resource or UI surface.

Ask one follow-up question only if the user still needs an adapter-specific implementation after the triage block.

## Minimum Answer Requirements

When a question falls into one of these problem types, the answer should include the listed concrete details.

| Problem type | Minimum details to include |
| --- | --- |
| Supabase list or relation queries | meta.select, meta.count when exact totals matter, and the root setup boundary where the fetcher is registered. |
| Directus query syntax questions | meta.query.fields and meta.query.filter, plus the Directus-only source boundary. |
| REST custom client or header questions | The REST adapter reference plus the custom client or header boundary. |
| Root wiring or global setup questions | App.vue or app.vue placement plus one backend-specific root wiring check. |
| Route-driven detail or edit questions | The resource-mapping prerequisite plus one adapter-specific id compatibility check. |
| Remote autocomplete questions | useSelect, selected-value persistence outside the current result set, and one backend query contract. |
| Undoable mutation questions | Notification prerequisite, supported mutation mode guidance, and a safer fallback when undoable is not ready. |
| Supabase auth-method questions | Supported login type values such as oauth and otp plus the matching params boundary. |
| Directus aggregate or grouped summary questions | meta.aggregate and meta.groupBy plus the non-page data-composable execution surface. |
| Realtime fallback questions | Current transport assumption, chosen strategy, starting cadence when polling is used, and one UX fallback such as manual refresh or last-updated state. |

## Realtime Fallback Playbook

When realtime transport is unavailable or unconfirmed, answer in this order:

1. State that push subscriptions are unavailable or not yet confirmed for the current resource or surface.
2. Choose one strategy: polling, manual refresh, or hybrid.
3. If polling is chosen, give a starting cadence:
   - frequently changing lists: 10-30 seconds
   - summary or dashboard surfaces: 15-60 seconds
   - cost-sensitive pages: start with manual refresh
4. Add one UX fallback such as a visible refresh action or last-updated indicator.
5. Add one tuning rule: increase the interval under load, and decrease it only when freshness requirements justify the cost.
6. Keep the wording capability-safe. Do not promise push updates without confirmed transport.

## Answer Contract

Every answer should:

1. Name the reference file or files used and why each one was needed.
2. State the hard prerequisite or boundary, such as root setup, route mapping, notification wiring, or transport availability.
3. Include backend safety output before recommending a pattern when adapter behavior matters.
4. Provide a fallback when the required backend capability is unavailable or unconfirmed.
5. Ask at most one clarifying question, and only after the routing chain and triage block are already complete.

## Anti-Assumption Rules

- Do not infer backend-specific meta fields across adapters.
- Do not claim realtime subscriptions for plain REST APIs unless the user confirms transport.
- Do not use page CRUD controllers for non-page mutation flows.
- Do not place provider registration in feature pages.
- Do not skip adapter-specific checks when choosing mutation mode, route-id handling, or fallback refresh strategy.
- If the API shape or adapter behavior is unclear, inspect the matching reference before answering.
