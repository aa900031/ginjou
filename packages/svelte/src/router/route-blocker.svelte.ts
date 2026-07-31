import type { Simplify } from 'type-fest'
import type { MaybeAccessor } from '../utils'
import type { UseRouterContextFromProps } from './context'
import { RouteBlocker } from '@ginjou/core'
import { onDestroy } from 'svelte'
import { extract } from '../utils'
import { useRouterContext } from './context'

export type UseRouteBlockerProps = MaybeAccessor<
	RouteBlocker.Props
>

export type UseRouteBlockerContext = Simplify<
	& UseRouterContextFromProps
>

export interface UseRouteBlockerResult {
	readonly state: RouteBlocker.StateValues
	proceed: () => void
	reset: () => void
}

export function useRouteBlocker(
	props: UseRouteBlockerProps,
	context?: UseRouteBlockerContext,
): UseRouteBlockerResult {
	const router = useRouterContext(context)
	let state = $state<RouteBlocker.StateValues>(RouteBlocker.State.Unblocked)

	if (router?.blocker == null) {
		return {
			get state() {
				return state
			},
			proceed: () => {},
			reset: () => {},
		}
	}

	const setState = (value: RouteBlocker.StateValues): void => {
		state = value
	}

	const handle = router.blocker(RouteBlocker.createShouldBlockFn({
		getShouldBlock: () => extract(props).shouldBlock,
		setState,
	}))

	const unsubscribe = router.onChangeLocation(() => {
		RouteBlocker.handleChangeLocation({ state, setState })
	})

	onDestroy(() => {
		handle.unregister()
		unsubscribe?.()
	})

	return {
		get state() {
			return state
		},
		proceed,
		reset,
	}

	function proceed(): void {
		RouteBlocker.proceed({ setState, handle })
	}

	function reset(): void {
		RouteBlocker.reset({ setState, handle })
	}
}
