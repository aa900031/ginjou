import type { ResolvedResource } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseLocationContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseResourceContextFromProps } from './context'
import { resolveResource } from '@ginjou/core'
import { useLocation } from '../router'
import { extract } from '../utils'
import { useResourceContext } from './context'

export type UseResourceProps = MaybeAccessor<
	| {
		name?: string
	}
	| undefined
>

export type UseResourceContext = Simplify<
	& UseResourceContextFromProps
	& UseLocationContext
>

export interface UseResourceResult {
	readonly value: ResolvedResource | undefined
}

export function useResource(
	props?: UseResourceProps,
	context?: UseResourceContext,
): UseResourceResult {
	const resource = useResourceContext(context)
	const location = useLocation(context)
	const resolvedProps = $derived(extract(props))

	const value = $derived.by(() => resolveResource(
		resource,
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
