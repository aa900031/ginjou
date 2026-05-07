import type { RouterLocation } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseRouterContextFromProps } from './context'
import { onDestroy } from 'svelte'
import { useRouterContext } from './context'

export type UseLocationContext = Simplify<
	& UseRouterContextFromProps
>

export interface UseLocationResult<
	TMeta = unknown,
> {
	readonly value: RouterLocation<TMeta> | undefined
}

export function useLocation<
	TMeta = unknown,
>(
	context?: UseLocationContext,
): UseLocationResult<TMeta> {
	const router = useRouterContext(context)

	let value = $state(router?.getLocation() as RouterLocation<TMeta> | undefined)

	const stop = router?.onChangeLocation((location) => {
		value = location as RouterLocation<TMeta>
	})

	onDestroy(() => {
		stop?.()
	})

	return {
		get value() {
			return value
		},
	}
}
