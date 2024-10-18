import type { Resource } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { inject, provide } from 'vue-demi'

const KEY = Symbol('@ginjou/resource')

export function defineResourceContext<
	T extends Resource,
>(value: T): T {
	provide(KEY, value)
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
	const value = inject(KEY, undefined) ?? props?.resource
	if (props?.strict === true && value == null)
		throw new Error('No')
	return value
}
