import type { Simplify } from 'type-fest'
import type { UseLocationContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseControllerContextFromProps } from './context'
import { Resource } from '@ginjou/core'
import { useLocation } from '../router'
import { extract } from '../utils'
import { useControllerContext } from './context'

export type UseResourceProps = MaybeAccessor<
	| {
		name?: string
	}
	| undefined
>

export type UseResourceContext = Simplify<
	& UseControllerContextFromProps
	& UseLocationContext
>

export interface UseResourceResult {
	readonly value: Resource.Resolved | undefined
}

export function useResource(
	props?: UseResourceProps,
	context?: UseResourceContext,
): UseResourceResult {
	const controller = useControllerContext(context)
	const location = useLocation(context)
	const resolvedProps = $derived(extract(props))

	const value = $derived.by(() => Resource.resolve(
		controller,
		{
			name: resolvedProps?.name,
			location: location.value,
		},
	))

	return {
		get value() {
			return value
		},
	}
}
