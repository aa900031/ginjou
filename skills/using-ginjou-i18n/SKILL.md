---
name: using-ginjou-i18n
description: Use when integrating localization with Ginjou, including translate function usage, locale switching, and i18n adapter wiring.
---

# Using Ginjou i18n

## Overview

Use this skill for i18n provider integration and runtime locale/translation usage.

Core behavior:
- register i18n context
- call translation function from `useTranslate`
- read and write locale from `useLocale`

## Vue and Nuxt Notes

- `@ginjou/with-vue-i18n` is the standard bridge when using `vue-i18n`.
- Integration contract is shared conceptually for Vue and Nuxt usage.

## Decision Rules

- `useTranslate()` returns a function, not an object.
- `useLocale()` is writable and depends on provider methods (`getLocale`, `setLocale`, `onChangeLocale`).
- Guard UI where missing translation keys may return undefined.

## Source Map

- `references/i18n.md`
- `https://ginjou.pages.dev/raw/integrations/vue.md`
- `https://ginjou.pages.dev/raw/integrations/nuxt.md`
- `stories/vue/src/I18nLocale.stories.ts`
- `packages/with-vue-i18n/src/index.ts`
