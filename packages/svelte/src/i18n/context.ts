import type { I18n } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/i18n')

export function defineI18nContext<T extends I18n>(value: T): T {
	return defineContext(KEY, value)
}

export interface UseI18nContextFromProps {
	i18n?: I18n
}

export type UseI18nContextProps = Simplify<
	& UseI18nContextFromProps
	& {
		strict?: boolean
	}
>

export function useI18nContext(
	props: UseI18nContextProps & { strict: true },
): I18n

export function useI18nContext(
	props?: UseI18nContextProps,
): I18n | undefined

export function useI18nContext(
	props?: UseI18nContextProps,
): I18n | undefined {
	const value = useContextValue(KEY, props?.i18n)

	if (props?.strict === true)
		return requireContext(value, 'i18n')

	return value
}
