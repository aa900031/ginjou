# Vue I18n

Use this reference for Vue i18n wiring and i18n composables. See [I18n](https://ginjou.pages.dev/raw/guides/i18n.md) for guide-level usage, provider walkthroughs, and locale examples.

## Contract

```ts
interface I18n {
	translate: I18nTranslateFn<Record<any, any>>
	getLocale?: I18nGetLocaleFn
	setLocale?: I18nSetLocaleFn<any>
	onChangeLocale?: I18nOnLocaleChangeFn
}
```

`translate` may return `undefined` for missing keys. Keep that boundary explicit when an undefined label would create broken UI or confusing empty output.

Locale boundary:

- `getLocale` reads the current locale.
- `setLocale` updates the locale.
- `onChangeLocale` lets the adapter react to locale changes.

If the app only needs translation lookup, `translate` alone is enough. If the app needs a live writable locale surface, implement all three locale methods.

## `defineI18nContext`

Register the i18n adapter once at the app root.

```ts
import { defineI18nContext } from '@ginjou/vue'
import { createI18n } from '@ginjou/with-vue-i18n'
import { createI18n as createVueI18n } from 'vue-i18n'

const vueI18n = createVueI18n({ locale: 'en-US', messages: { 'en-US': { hi: 'Hello' } } })

defineI18nContext(createI18n(vueI18n))
```

## `useTranslate`

`useTranslate()` returns a function directly.

```ts
import { useTranslate } from '@ginjou/vue'

const t = useTranslate()
```

## `useLocale`

`useLocale()` returns a writable `Ref<string>` for the current locale.

```vue
<script setup lang="ts">
import { useLocale, useTranslate } from '@ginjou/vue'

const t = useTranslate()
const locale = useLocale()
</script>
```

## Rules

- Treat translation and locale switching as separate capabilities.
- Register `defineI18nContext` unconditionally at the app root.
- Treat `useTranslate()` as a function return value, not an object.
- Use `useLocale()` only when the i18n adapter implements the full locale trio.
- Guard against missing-key `undefined` output where an undefined label would break the UI.
- Keep adapter-specific library details in the adapter layer, not in the core contract.
