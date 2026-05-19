import type { RouterLocation } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { ReadonlyBox } from '../utils'
import type { UseRouterContextFromProps } from './context'
import { onDestroy } from 'svelte'
import { box } from '../utils'
import { useRouterContext } from './context'

export type UseLocationContext = Simplify<
	& UseRouterContextFromProps
>

export type UseLocationResult<
	TMeta = unknown,
> = ReadonlyBox<RouterLocation<TMeta> | undefined>

export function useLocation<
	TMeta = unknown,
>(
	context?: UseLocationContext,
): UseLocationResult<TMeta> {
	const router = useRouterContext(context)

	let value = $state(router?.getLocation() as RouterLocation<TMeta> | undefined)

	const stop = router?.onChangeLocation((location: RouterLocation<TMeta>) => {
		value = location
	})

	onDestroy(() => {
		stop?.()
	})

	return box(() => value)
}
