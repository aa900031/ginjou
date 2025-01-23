import type { TranslateFn } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseI18nContextFromProps } from './context'
import { createTranslateFn } from '@ginjou/core'
import { useI18nContext } from './context'

export type UseTranslateContext = Simplify<
	& UseI18nContextFromProps
>

export function useTranslate<
	TParams = unknown,
>(
	context?: UseTranslateContext,
): TranslateFn<TParams> {
	const i18n = useI18nContext(context)

	return createTranslateFn({
		i18n,
	})
}
