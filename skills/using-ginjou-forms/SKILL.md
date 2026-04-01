---
name: using-ginjou-forms
description: Use when implementing standard create and edit page form flows with Ginjou controllers, including save behavior, form initialization, delete confirmation, and mutation mode choices.
---

# Using Ginjou Forms

## Overview

Use this skill for standard CRUD form-page behavior.

Primary composables:
- `useCreate`
- `useEdit`
- `useDeleteOne` (for delete actions tied to form/page flows)

## When This Skill Fits

- Create page form that submits with `save(data)`
- Edit page form that loads `record` and saves changes
- Standard redirect behavior after save
- Mutation mode decisions for form flows (`pessimistic`, `optimistic`, `undoable`)

## Vue and Nuxt Notes

- Vue and Nuxt both use `useCreate` and `useEdit`.
- `useCreate` has no async variant in Nuxt.
- For Nuxt SSR reads in form pages, pair with `using-ginjou-setup` and async read variants where applicable.
- For Nuxt SSR edit pages, prefetch record data with async read variants, then keep submit behavior in `useEdit`.

## Required Form Pattern

- For edit forms, copy `record` into local reactive form state.
- Do not bind input models directly to `record`.

## Decision Rules

- If mutation logic is embedded in dialogs/widgets or custom orchestration, switch to `using-ginjou-data`.
- If the question is list/show/select read behavior, switch to `using-ginjou-lists`.
- `undoable` mutation mode requires notification provider wiring.

## Source Map

- `references/forms.md`
- `https://ginjou.pages.dev/raw/guides/form.md`
- `stories/vue/src/Form.stories.ts`
- `stories/vue/src/Create.stories.ts`
- `stories/vue/src/Update.stories.ts`
- `stories/vue/src/Delete.stories.ts`
