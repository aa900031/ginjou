import type { Simplify } from 'type-fest'
import type { MaybeAccessor } from '../utils'
import type { UseRouterContextFromProps } from './context'
import { RouteBlocker } from '@ginjou/core'
import { onDestroy } from 'svelte'
import { extract } from '../utils'
import { watch } from '../utils/watch.svelte'
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

	const resolvedProps = $derived(extract(props))
	const enabled = $derived(RouteBlocker.getEnabled(resolvedProps.enabled))

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

	const blocker = router.blocker(
		input => RouteBlocker.resolveShouldBlock(resolvedProps.shouldBlock, input),
	)
	const unsubscribe = blocker.subscribe((value) => {
		state = value
	})

	const stopWatch = watch(
		() => enabled,
		value => blocker.setEnabled(value),
		{ immediate: true },
	)

	onDestroy(() => {
		stopWatch()
		unsubscribe()
		blocker.dispose()
	})

	return {
		get state() {
			return state
		},
		proceed: () => blocker.proceed(),
		reset: () => blocker.reset(),
	}
}
