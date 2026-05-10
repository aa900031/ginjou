import type { Params } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseI18nContextFromProps } from './context'
import { Translate } from '@ginjou/core'
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
): Translate.Fn<TParams> {
	const i18n = useI18nContext(context)
	let fn = $state.raw(Translate.createFn({
		i18n,
	}))

	if (i18n) {
		const locale = useLocale()
		watch(() => locale.value, () => {
			fn = Translate.createFn({ i18n })
		})
	}

	return (
		(key, params, defaultValue) =>
			fn(key, params, defaultValue)
	) as Translate.Fn<TParams>
}
