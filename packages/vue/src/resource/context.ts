import type { Resource } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionGetter, InjectionGetterKey } from '../utils/inject'
import type { ProvideFn } from '../utils/provide'
import { provide } from 'vue-demi'
import { injectGetter } from '../utils/inject'

const KEY: InjectionGetterKey<Resource> = Symbol('@ginjou/resource')

export function defineResourceContext<
	T extends InjectionGetter<Resource>,
>(
	value: T,
	provideFn: ProvideFn = provide,
): T {
	provideFn(KEY, value)
	return value
}

export interface UseResourceContextFromProps {
	resource?: Resource
}

export type UseResourceContextProps = Simplify<
	& UseResourceContextFromProps
	& {
		strict?: boolean
	}
>

export function useResourceContext(
	props: UseResourceContextProps & { strict: true },
): Resource

export function useResourceContext(
	props?: UseResourceContextProps,
): Resource | undefined

export function useResourceContext(
	props?: UseResourceContextProps,
): Resource | undefined {
	const value = injectGetter(KEY) ?? props?.resource
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
