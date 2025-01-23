import type { I18n } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { getContext, setContext } from 'svelte'

const KEY = '$$_@ginjou/i18n'

export function defineI18nContext<
	T extends I18n,
>(
	value: T,
): T {
	setContext(KEY, value)
	return value
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
	const value = getContext<I18n>(KEY) ?? props?.i18n
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
