---
name: using-ginjou-data
description: Use when implementing non-page data flows with low-level Ginjou queries and mutations, including row actions, confirmation modals, inline side panels, widgets, batch operations, and custom endpoints.
---

# Using Ginjou Data

## Overview

Use this skill for low-level data composables and custom orchestration.

This is the right path for:
- non-page CRUD actions
- row actions and confirmation modals
- inline side-panel edits and widget mutations
- dynamic target mutations
- batch operations
- custom endpoint calls

## Query Surface

- `useGetList`
- `useGetOne`
- `useGetMany`
- `useGetInfiniteList`
- `useCustom`

## Mutation Surface

- `useCreateOne`
- `useCreateMany`
- `useUpdateOne`
- `useUpdateMany`
- `useDeleteOne`
- `useDeleteMany`
- `useCustomMutation`

## Vue and Nuxt Notes

- Vue uses regular data composables.
- Nuxt SSR pages should use async read variants:
  - `useAsyncGetList`
  - `useAsyncGetOne`
  - `useAsyncGetMany`
  - `useAsyncGetInfiniteList`
- Mutation composables remain client-triggered.

## Call-time vs Setup-time Arguments

- Setup-time args are best when target resource/id is fixed.
- Call-time args are best for dynamic row actions and dialog flows.

## Decision Rules

- If the flow is a standard page controller, switch to `using-ginjou-lists` or `using-ginjou-forms`.
- For standard select/autocomplete option loading tied to form inputs, prefer `using-ginjou-lists` (`useSelect`).
- If the prompt mentions each-row actions, custom confirmation modals, side panels, or dashboard widgets, stay here even if the surrounding screen is a page.
- If the prompt compares a row action or modal delete against `useEdit` or another page CRUD abstraction, stay here and explain that page CRUD controllers are the wrong model for non-page mutation flows.
- If the question is backend-specific `meta` behavior, pair with `using-ginjou-backends`.
- For bulk actions, prefer `*Many` APIs over loops of single mutations.
- If custom flows use `undoable` mutation mode, ensure notification provider wiring via `using-ginjou-notifications`.

## Source Map

- `references/data-composables.md`
- `https://ginjou.pages.dev/raw/guides/data.md`
- `stories/vue/src/GetList.stories.ts`
- `stories/vue/src/GetOne.stories.ts`
- `stories/vue/src/Create.stories.ts`
- `stories/vue/src/Update.stories.ts`
- `stories/vue/src/Delete.stories.ts`
