import type { Params, TranslateFn } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseI18nContextFromProps } from './context'
import { createTranslateFn } from '@ginjou/core'
import { watch } from '../utils'
import { useI18nContext } from './context'
import { useLocale } from './locale.svelte'

export type UseTranslateContext = Simplify<
	& UseI18nContextFromProps
>

export function useTranslate<
	TParams extends Params = Params,
>(
	context?: UseTranslateContext,
): TranslateFn<TParams> {
	const i18n = useI18nContext(context)
	const locale = useLocale()
	let fn = $state.raw(createTranslateFn({
		i18n,
	}))

	watch(() => locale.value, () => {
		fn = createTranslateFn({ i18n })
	})

	return (
		(key, params, defaultValue) =>
			fn(key, params, defaultValue)
	) as TranslateFn<TParams>
}
