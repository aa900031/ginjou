import type { Fetchers } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { InjectionKey } from 'vue-demi'
import { inject, provide } from 'vue-demi'

const KEY: InjectionKey<Fetchers> = Symbol('@ginjou/fetchers')

export function defineFetchersContext<
	T extends Fetchers,
>(
	value: T,
): T {
	provide(KEY, value)
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
	const value = inject(KEY, undefined) ?? props?.fetchers
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
