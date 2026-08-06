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

	// svelte-ignore state_referenced_locally -- the initial value is the point: registering is a
	// one-off, and the watch below is what carries every change after it.
	const blocker = router.blocker({
		should: input => RouteBlocker.resolveShouldBlock(resolvedProps.shouldBlock, input),
		enabled,
	})
	const unsubscribe = blocker.subscribe((value) => {
		state = value
	})

	const stopWatch = watch(
		() => enabled,
		value => blocker.setEnabled(value),
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
