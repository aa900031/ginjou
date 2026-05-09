import type { Fetchers } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/fetchers')

export function defineFetchersContext<T extends Fetchers>(value: T): T {
	return defineContext(KEY, value)
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
	const value = useContextValue(KEY, props?.fetchers)

	if (props?.strict === true)
		return requireContext(value, 'fetchers')

	return value
}
