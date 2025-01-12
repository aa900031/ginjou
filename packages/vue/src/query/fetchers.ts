import type { Fetchers } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionGetter, InjectionGetterKey } from '../utils/inject'
import type { ProvideFn } from '../utils/provide'
import { provide } from 'vue-demi'
import { injectGetter } from '../utils/inject'

const KEY: InjectionGetterKey<Fetchers> = Symbol('@ginjou/fetchers')

export function defineFetchers<
	T extends InjectionGetter<Fetchers>,
>(
	value: T,
	provideFn: ProvideFn = provide,
): T {
	provideFn(KEY, value)
	return value
}

export interface UseFetcherContextFromProps {
	fetchers?: Fetchers
}

export type UseFetchersContextProps = Simplify<
	& UseFetcherContextFromProps
	& {
		strict?: boolean
	}
>

export function useFetchersContext(
	props: UseFetchersContextProps & { strict: true },
): Fetchers

export function useFetchersContext(
	props?: UseFetchersContextProps,
): Fetchers | undefined

export function useFetchersContext(
	props?: UseFetchersContextProps,
): Fetchers | undefined {
	const value = injectGetter(KEY) ?? props?.fetchers
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
