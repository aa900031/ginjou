import type { Simplify } from 'type-fest'
import { onScopeDispose, shallowRef } from 'vue-demi'
import type { UseRouterContextFromProps } from './context'
import { useRouterContext } from './context'

export type UseCurrentRouteContext = Simplify<
	& UseRouterContextFromProps
>

export function useCurrentRoute(
	context?: UseCurrentRouteContext,
) {
	const router = useRouterContext(context)

	const result = shallowRef(router?.getCurrent())
	const stop = router?.onCurrentChange(val => result.value = val)

	stop && onScopeDispose(() => {
		stop?.()
	})

	return result
}
