import type { Resource } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { defineContext, requireContext, useContextValue } from '../utils'

const KEY = Symbol('@ginjou/resource')

export function defineResourceContext<T extends Resource>(value: T): T {
	return defineContext(KEY, value)
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
	const value = useContextValue(KEY, props?.resource)

	if (props?.strict === true)
		return requireContext(value, 'resource')

	return value
}
