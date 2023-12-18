import type { Simplify } from 'type-fest'
import type { I18nTranslateFn } from '@ginjou/core'
import { type UseI18nContextFromProps, useI18nContext } from './context'

export type UseTranslateContext = Simplify<
	& UseI18nContextFromProps
>

export function useTranslate<
	TParams = unknown,
>(
	context?: UseTranslateContext,
): I18nTranslateFn<TParams> {
	const i18n = useI18nContext(context)

	return (...args) => i18n!.translate(...args)
}
