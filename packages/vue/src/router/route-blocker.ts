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

	const blocker = router.blocker({
		should: input => RouteBlocker.resolveShouldBlock(unref(props.shouldBlock), input),
		enabled: enabled.value,
	})
	const unsubscribe = blocker.subscribe((value) => {
		state.value = value
	})

	watch(
		enabled,
		value => blocker.setEnabled(value),
		{ flush: 'sync' },
	)

	tryOnScopeDispose(() => {
		unsubscribe()
		blocker.dispose()
	})

	return {
		state: publicState,
		proceed: () => blocker.proceed(),
		reset: () => blocker.reset(),
	}
}
