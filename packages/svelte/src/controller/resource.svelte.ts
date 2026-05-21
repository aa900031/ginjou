import type { Simplify } from 'type-fest'
import type { UseLocationContext } from '../router'
import type { MaybeAccessor, ReadonlyBox } from '../utils'
import type { UseControllerContextFromProps } from './context'
import { Resource } from '@ginjou/core'
import { useLocation } from '../router'
import { extract, unbox } from '../utils'
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

export type UseResourceResult = ReadonlyBox<Resource.Resolved | undefined>

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
			location: unbox(location),
		},
	))

	return {
		get value() {
			return value
		},
	}
}
