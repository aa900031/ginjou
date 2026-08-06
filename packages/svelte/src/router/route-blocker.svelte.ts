import type { RouterBlockerController } from '@ginjou/core'
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

	const blocker = router.blocker

	let controller: RouterBlockerController | undefined
	let unsubscribe: (() => void) | undefined

	const stopWatch = watch(
		() => enabled,
		(enabled) => {
			if (enabled === (controller != null))
				return

			if (!enabled) {
				teardown()
				return
			}

			controller = blocker(input => RouteBlocker.resolveShouldBlock(resolvedProps.shouldBlock, input))
			unsubscribe = controller.subscribe((value) => {
				state = value
			})
		},
		{ immediate: true },
	)

	onDestroy(() => {
		stopWatch()
		teardown()
	})

	return {
		get state() {
			return state
		},
		proceed: () => controller?.proceed(),
		reset: () => controller?.reset(),
	}

	function teardown(): void {
		unsubscribe?.()
		unsubscribe = undefined
		controller?.dispose()
		controller = undefined
		state = RouteBlocker.State.Unblocked
	}
}
