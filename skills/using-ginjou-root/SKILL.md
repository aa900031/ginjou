---
name: using-ginjou-root
description: Use when a request is about using Ginjou and you need to route to the smallest focused using-ginjou-* sub-skill before writing code.
---

# Using Ginjou Root

## Overview

This skill is a strict dispatcher for Ginjou usage work.

Do not implement from this file directly. Route to one or more focused sub-skills first, then follow those sub-skills.

## Routing Map

| User intent or symptom | Route to |
| --- | --- |
| App-root registration, provider wiring, Vue or Nuxt setup, SSR read composables | `using-ginjou-setup` |
| Backend choice, backend-specific auth, backend-specific `meta` syntax (REST, Supabase, Directus) | `using-ginjou-backends` |
| Resource definitions, route-action mapping, nested resources, `meta.fetcherName` | `using-ginjou-resources` |
| List pages, pagination, filters, sorters, infinite list, select/autocomplete options | `using-ginjou-lists` |
| Standard create/edit pages, form save flow, delete confirmation, mutation mode in form flows | `using-ginjou-forms` |
| Non-page queries/mutations, dialogs/widgets, batch operations, custom endpoints | `using-ginjou-data` |
| Login/logout/session checks, identity loading, auth error checks | `using-ginjou-authentication` |
| Access checks, role-based UI, permissions loading | `using-ginjou-authorization` |
| Toast/notification provider wiring, `useNotify`, undoable mutation progress | `using-ginjou-notifications` |
| Realtime subscriptions, auto/manual realtime behavior, polling fallback | `using-ginjou-realtime` |
| Translation, locale switching, i18n provider integration | `using-ginjou-i18n` |

## Ambiguity Rules

Ask one clarifying question only when routing is ambiguous.

1. `lists` vs `data`
- If the UI is a standard page with pagination/filter/sorter state, route to `using-ginjou-lists`.
- If the UI is standard form-input option loading (select/autocomplete), route to `using-ginjou-lists`.
- If the UI is a dialog, widget, or arbitrary fetch/mutation flow, route to `using-ginjou-data`.

2. `forms` vs `data`
- If the flow is standard create/edit page behavior with `save()`, including `undoable` mutation mode, route to `using-ginjou-forms`.
- If the flow is custom mutation orchestration with `mutateAsync`, dialogs, or dynamic mutation targets, route to `using-ginjou-data`.

3. `authentication` vs `authorization`
- Identity/session/login/logout concerns route to `using-ginjou-authentication`.
- Permission and action access concerns route to `using-ginjou-authorization`.

4. `setup` vs `backends`
- Root registration and framework setup route to `using-ginjou-setup`.
- Backend capability or backend-specific query/auth details route to `using-ginjou-backends`.

## Routing Process

1. Detect framework context (Vue or Nuxt) from dependencies, app structure, and existing setup.
2. Detect backend context (REST, Supabase, Directus, or mixed) from fetcher/auth setup.
3. Route to the smallest matching sub-skill.
4. If the task spans domains, load multiple sub-skills explicitly.
5. State which sub-skill(s) guided the final implementation.

## Rules

- Do not answer from memory when a sub-skill applies.
- Route first, then implement.
- Prefer one sub-skill when the request is narrow.
- Use multiple sub-skills for cross-domain tasks (for example: setup + resources + backends).
- Keep framework differences inside the selected sub-skill references; do not create framework-specific routing branches here.

## Source Anchors

- Local sub-skill references: `skills/using-ginjou-*/references/*.md`
- Guides: `https://ginjou.pages.dev/raw/guides/*.md`
- Integrations: `https://ginjou.pages.dev/raw/integrations/*.md`
- Backends: `https://ginjou.pages.dev/raw/backend/*.md`
- Usage examples: `stories/vue/src/*.stories.ts`
