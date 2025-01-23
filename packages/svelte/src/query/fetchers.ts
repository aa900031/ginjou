import type { Fetchers } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { getContext, setContext } from 'svelte'

const KEY = '$$_@ginjou/fetchers'

export function defineFetchers<
	T extends Fetchers,
>(
	value: T,
): T {
	setContext(KEY, value)
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
	const value = getContext<Fetchers>(KEY) ?? props?.fetchers
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
