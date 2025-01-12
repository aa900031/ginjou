import type { I18n } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionGetter, InjectionGetterKey } from '../utils/inject'
import type { ProvideFn } from '../utils/provide'
import { provide } from 'vue-demi'
import { injectGetter } from '../utils/inject'

const KEY: InjectionGetterKey<I18n> = Symbol('@ginjou/i18n')

export function defineI18nContext<
	T extends InjectionGetter<I18n>,
>(
	value: T,
	provideFn: ProvideFn = provide,
): T {
	provideFn(KEY, value)
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
	const value = injectGetter(KEY) ?? props?.i18n
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
