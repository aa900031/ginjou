---
name: using-ginjou-lists
description: Use when building list-oriented and read-side page flows with Ginjou controllers, including pagination, filters, sorters, infinite list, detail pages, and select option loading.
---

# Using Ginjou Lists

## Overview

Use this skill for standard read-side page controllers.

This includes:
- `useList`
- `useInfiniteList`
- `useShow`
- `useSelect`

## When This Skill Fits

- Page-level list state with pagination/filter/sorter management
- Infinite scroll or load-more pages
- Route-aware detail page reads
- Remote option loading for select/autocomplete inputs
- Input-bound select/autocomplete behavior where `useSelect` should keep current value visibility

## Vue and Nuxt Reference

- Vue uses the regular composables.
- Nuxt SSR pages should use async read counterparts:
  - `useAsyncList`
  - `useAsyncInfiniteList`
  - `useAsyncShow`
  - `useAsyncSelect`

## Decision Rules

- If the UI is not a standard page flow (dialogs/widgets/custom orchestration), switch to `using-ginjou-data`.
- If the requirement is arbitrary query results for widgets or dialogs, switch to `using-ginjou-data` instead of forcing `useSelect`.
- If the task is create/edit page submit behavior, switch to `using-ginjou-forms`.
- `useInfiniteList` returns page-grouped records; render with nested loops.
- `syncRoute: true` requires router integration in Vue setups.

## Source Map

- `references/controllers.md`
- `https://ginjou.pages.dev/raw/guides/list.md`
- `https://ginjou.pages.dev/raw/guides/data.md`
- `stories/vue/src/List.stories.ts`
- `stories/vue/src/InfiniteList.stories.ts`
- `stories/vue/src/Show.stories.ts`
- `stories/vue/src/Select.stories.ts`
