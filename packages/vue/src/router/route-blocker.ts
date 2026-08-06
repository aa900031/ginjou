import type { RouterBlockerController } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseRouterContextFromProps } from './context'
import { RouteBlocker } from '@ginjou/core'
import { noop, tryOnScopeDispose } from '@vueuse/shared'
import { computed, readonly, ref, unref, watch } from 'vue-demi'
import { useRouterContext } from './context'

export type UseRouteBlockerProps = ToMaybeRefs<
	RouteBlocker.Props
>

export type UseRouteBlockerContext = Simplify<
	& UseRouterContextFromProps
>

export interface UseRouteBlockerResult {
	state: Ref<RouteBlocker.StateValues>
	proceed: () => void
	reset: () => void
}

export function useRouteBlocker(
	props: UseRouteBlockerProps,
	context?: UseRouteBlockerContext,
): UseRouteBlockerResult {
	const router = useRouterContext(context)

	const enabled = computed(() => RouteBlocker.getEnabled(unref(props.enabled)))

	const state = ref<RouteBlocker.StateValues>(RouteBlocker.State.Unblocked)
	const publicState = readonly(state)

	if (router?.blocker == null) {
		return {
			state: publicState,
			proceed: noop,
			reset: noop,
		}
	}

	const blocker = router.blocker

	let controller: RouterBlockerController | undefined
	let unsubscribe: (() => void) | undefined
	watch(
		enabled,
		(enabled) => {
			if (enabled === (controller != null))
				return

			if (!enabled) {
				teardown()
				return
			}

			controller = blocker(input => RouteBlocker.resolveShouldBlock(unref(props.shouldBlock), input))
			unsubscribe = controller.subscribe((value) => {
				state.value = value
			})
		},
		{ immediate: true, flush: 'sync' },
	)

	tryOnScopeDispose(teardown)

	return {
		state: publicState,
		proceed: () => controller?.proceed(),
		reset: () => controller?.reset(),
	}

	function teardown(): void {
		unsubscribe?.()
		unsubscribe = undefined
		controller?.dispose()
		controller = undefined
		state.value = RouteBlocker.State.Unblocked
	}
}
