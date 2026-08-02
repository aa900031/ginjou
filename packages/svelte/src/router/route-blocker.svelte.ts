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

	const registrar = RouteBlocker.createRegistrar({
		blocker: router.blocker,
		getShouldBlock: () => resolvedProps.shouldBlock,
		setState,
	})

	// Registration follows `enabled`, blocking follows `shouldBlock`.
	//
	// No sync-flush counterpart to the vue adapter's, and none is needed. The first run is already
	// synchronous — `$effect.pre` carries no `EFFECT` flag, so it runs at creation instead of being
	// scheduled — and a later re-run cannot lose a navigation either: svelte-spa-router's `push`,
	// `replace` and `pop` all `await tick()` before touching the hash, and its route resolution is a
	// plain `$effect`, which a batch runs after every `$effect.pre`, across roots. Svelte offers no
	// supported way to do it regardless: its one synchronous effect flavour is unexported and
	// forbids writing `$state`, which `sync` does.
	const stopWatch = watch(
		() => RouteBlocker.shouldRegister({
			enabled: resolvedProps.enabled,
			state,
		}),
		registrar.sync,
		{ immediate: true },
	)

	const unsubscribe = router.onChangeLocation(() => {
		RouteBlocker.handleChangeLocation({ state, setState })
	})

	onDestroy(() => {
		stopWatch()
		registrar.dispose()
		unsubscribe?.()
	})

	return {
		get state() {
			return state
		},
		proceed: registrar.proceed,
		reset: registrar.reset,
	}
}
