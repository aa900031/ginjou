import type { Simplify } from 'type-fest'
import type { UseResourceContext } from '../controller'
import type { MaybeAccessor } from '../utils'
import type { UseGoContext } from './go.svelte'
import { Navigate } from '@ginjou/core'
import { useControllerContext } from '../controller'
import { extract } from '../utils'
import { useGo } from './go.svelte'

export type UseNavigateToProps = MaybeAccessor<
	| Navigate.Props
	| undefined
>

export type UseNavigateToContext = Simplify<
	& UseGoContext
	& UseResourceContext
>

export function useNavigateTo(
	props?: UseNavigateToProps,
	context?: UseNavigateToContext,
): Navigate.ToFn {
	const controllerContext = useControllerContext(context)
	const go = useGo(context)

	const resolvedProps = $derived(extract(props))

	return Navigate.createToFn({
		go,
		getResourceFromProp: () => resolvedProps?.resource,
		controller: controllerContext,
	})
}
