import type { Params } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseI18nContextFromProps } from './context'
import { Translate } from '@ginjou/core'
import { useI18nContext } from './context'

export type UseTranslateContext = Simplify<
	& UseI18nContextFromProps
>

export function useTranslate<
	TParams extends Params = Params,
>(
	context?: UseTranslateContext,
): Translate.Fn<TParams> {
	const i18n = useI18nContext(context)

	return Translate.createFn({
		i18n,
	})
}
