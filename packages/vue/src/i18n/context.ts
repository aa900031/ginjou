import type { I18n } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'

const KEY: InjectionKey<I18n> = Symbol('@ginjou/i18n')

export function defineI18nContext<
	T extends I18n,
>(
	value: T,
): T {
	provide(KEY, value)
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
	const value = inject(KEY, undefined) ?? props?.i18n
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
