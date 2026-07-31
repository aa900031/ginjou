import type { Simplify } from 'type-fest'
import type { ComputedRef } from 'vue-demi'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseRouterContextFromProps } from './context'
import { RouteBlocker } from '@ginjou/core'
import { noop, tryOnScopeDispose } from '@vueuse/shared'
import { computed, ref, unref } from 'vue-demi'
import { useRouterContext } from './context'

export type UseRouteBlockerProps = ToMaybeRefs<
	RouteBlocker.Props
>

export type UseRouteBlockerContext = Simplify<
	& UseRouterContextFromProps
>

export interface UseRouteBlockerResult {
	state: ComputedRef<RouteBlocker.StateValues>
	proceed: () => void
	reset: () => void
}

export function useRouteBlocker(
	props: UseRouteBlockerProps,
	context?: UseRouteBlockerContext,
): UseRouteBlockerResult {
	const router = useRouterContext(context)
	const state = ref<RouteBlocker.StateValues>(RouteBlocker.State.Unblocked)

	if (router?.blocker == null) {
		return {
			state: computed(() => state.value),
			proceed: noop,
			reset: noop,
		}
	}

	const setState = (value: RouteBlocker.StateValues): void => {
		state.value = value
	}

	const handle = router.blocker(RouteBlocker.createShouldBlockFn({
		getShouldBlock: () => unref(props.shouldBlock),
		setState,
	}))

	const unsubscribe = router.onChangeLocation(() => {
		RouteBlocker.handleChangeLocation({ state: state.value, setState })
	})

	tryOnScopeDispose(() => {
		handle.unregister()
		unsubscribe?.()
	})

	return {
		state: computed(() => state.value),
		proceed: () => RouteBlocker.proceed({ setState, handle }),
		reset: () => RouteBlocker.reset({ setState, handle }),
	}
}
