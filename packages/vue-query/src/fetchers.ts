import type { Fetchers } from '@ginjou/query'
import { type InjectionKey, inject, provide } from 'vue-demi'

const KEY: InjectionKey<Fetchers> = Symbol('@ginjou/fetchers')

export function defineFetchers<
	T extends Fetchers,
>(
	value: T,
): T {
	provide(KEY, value)
	return value
}

export interface UseFetchersContextProps {
	fetchers?: Fetchers
	strict?: boolean
}

export function useFetchersContext(
	props: UseFetchersContextProps & { strict: true },
): Fetchers

export function useFetchersContext(
	props?: UseFetchersContextProps,
): Fetchers | undefined

export function useFetchersContext(
	props?: UseFetchersContextProps,
): Fetchers | undefined {
	const value = inject(KEY, undefined) ?? props?.fetchers
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
