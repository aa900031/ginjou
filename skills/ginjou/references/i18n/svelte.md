# Svelte I18n

Translation/locale wiring for Svelte 5. See [I18n](https://ginjou.pages.dev/raw/guides/i18n.md) for guide-level usage, provider walkthroughs, and locale examples. This file pins the Svelte syntax.

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

`defineI18nContext` takes an i18n adapter. The Vue example uses
`@ginjou/with-vue-i18n`; for Svelte, pass an adapter that implements the same
core i18n contract.

```svelte
<script lang="ts">
import { defineI18nContext } from '@ginjou/svelte'

defineI18nContext(/* an adapter implementing the core I18n contract */)
</script>
```

## `useTranslate` / `useLocale`

`useTranslate()` returns a function; `useLocale()` exposes the current locale as
reactive state. Read both directly — no `.value` wrapper.

```svelte
<script lang="ts">
import { useLocale, useTranslate } from '@ginjou/svelte'

const t = useTranslate()
const locale = useLocale()
</script>

<p>{t('hi')}</p>
```

## Rules

- Treat translation and locale switching as separate capabilities.
- Treat `useTranslate()` as a function, not an object.
- Use `useLocale()` only when the adapter implements the full locale trio.
- Guard against missing-key `undefined` output where an undefined label would break the UI.
- Keep adapter-specific library details in the adapter layer, not in the core contract.
