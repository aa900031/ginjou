import type { Access } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionGetter, InjectionGetterKey } from '../utils/inject'
import type { ProvideFn } from '../utils/provide'
import { provide } from 'vue-demi'
import { injectGetter } from '../utils/inject'

const KEY: InjectionGetterKey<Access> = Symbol('@ginjou/access')

export function defineAccess<
	T extends InjectionGetter<Access>,
>(
	value: T,
	provideFn: ProvideFn = provide,
) {
	provideFn(KEY, value)
	return value
}

export interface UseAccessContextFromProps {
	access?: Access
}

export type UseAccessContextProps = Simplify<
	& UseAccessContextFromProps
	& {
		strict?: boolean
	}
>

export function useAccessContext(
	props: UseAccessContextProps & { strict: true },
): Access

export function useAccessContext(
	props?: UseAccessContextProps,
): Access | undefined

export function useAccessContext(
	props?: UseAccessContextProps,
): Access | undefined {
	const value = injectGetter(KEY) ?? props?.access
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
