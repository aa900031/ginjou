---
name: using-ginjou-resources
description: Use when defining Ginjou resources, route-action mapping, nested resources, or per-resource fetcher binding in multi-backend apps.
---

# Using Ginjou Resources

## Overview

Use this skill for resource definitions and route-aware behavior.

Resources are optional. Add them only when the app needs route-driven resource/action/id resolution, navigation helpers, hierarchy, or multi-backend binding.

## Core Responsibilities

- Define `resources` through `defineResourceContext`
- Map CRUD routes (`list`, `create`, `edit`, `show`)
- Configure nested resources with `meta.parent`
- Bind fetchers with `meta.fetcherName`

## Key Meta Fields

| Field | Purpose |
| --- | --- |
| `parent` | Resource hierarchy for nested relationships |
| `fetcherName` | Selects named fetcher registered in `defineFetchersContext` |
| `hide` | Excludes from generated navigation while preserving resolution |
| `deletable` | Signals delete action availability in generated navigation |

## Vue and Nuxt Notes

- The resource contract is shared across Vue and Nuxt.
- Route pattern strings must match the active router path patterns exactly.
- Without resource configuration, pass `resource` and `id` explicitly in composables.

## Multi-Backend Setup with fetcherName

1. Register named fetchers in `defineFetchersContext` via `using-ginjou-setup`.
2. Bind each resource with `meta.fetcherName`.
3. For backend-specific `meta` syntax, pair with `using-ginjou-backends`.

## Decision Rules

- If the task is about app-root wiring, pair with `using-ginjou-setup`.
- If the task is about backend query/auth specifics, pair with `using-ginjou-backends`.
- If the task only needs local, explicit IDs and no route mapping, skip resources.

## Source Map

- `references/resources.md`
- `https://ginjou.pages.dev/raw/guides/resources.md`
- `https://ginjou.pages.dev/raw/guides/introduction.md`
- `packages/core/src/resource/index.ts`
