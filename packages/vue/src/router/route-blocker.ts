import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseRouterContextFromProps } from './context'
import { RouteBlocker } from '@ginjou/core'
import { noop, tryOnScopeDispose } from '@vueuse/shared'
import { readonly, ref, unref, watch } from 'vue-demi'
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
	const state = ref<RouteBlocker.StateValues>(RouteBlocker.State.Unblocked)
	const publicState = readonly(state)

	if (router?.blocker == null) {
		return {
			state: publicState,
			proceed: noop,
			reset: noop,
		}
	}

	const setState = (value: RouteBlocker.StateValues): void => {
		state.value = value
	}

	const registrar = RouteBlocker.createRegistrar({
		blocker: router.blocker,
		getShouldBlock: () => unref(props.shouldBlock),
		getState: () => state.value,
		setState,
	})

	// Registration follows `enabled`, blocking follows `shouldBlock`.
	//
	// `flush: 'sync'` is insurance, not a fix for anything demonstrated: vue-router reaches
	// `beforeEach` off a promise chain at least two microtasks after `push()` returns, so a
	// pre-flush watcher would win that race anyway. A `setState` from inside a guard cannot
	// re-enter this either, because `watch` does not fire on an unchanged source.
	watch(
		() => RouteBlocker.shouldRegister({
			enabled: unref(props.enabled),
			state: state.value,
		}),
		registrar.sync,
		{ immediate: true, flush: 'sync' },
	)

	const unsubscribe = router.onChangeLocation(() => {
		RouteBlocker.handleChangeLocation({ state: state.value, setState })
	})

	tryOnScopeDispose(() => {
		registrar.dispose()
		unsubscribe?.()
	})

	return {
		state: publicState,
		proceed: registrar.proceed,
		reset: registrar.reset,
	}
}
