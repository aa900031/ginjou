import type { Simplify } from 'type-fest'
import type { UseRouteBlockerContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseControllerContextFromProps } from './context'
import { RouteBlocker, WarnUnsaved } from '@ginjou/core'
import { useRouteBlocker } from '../router'
import { extract, watch } from '../utils'
import { useControllerContext } from './context'

export type UseWarnUnsavedProps = MaybeAccessor<
	| WarnUnsaved.Props
	| undefined
>

export type UseWarnUnsavedContext = Simplify<
	& UseControllerContextFromProps
	& UseRouteBlockerContext
>

export interface UseWarnUnsavedResult {
	active: boolean
	readonly state: WarnUnsaved.StateValues
}

export function useWarnUnsaved(
	props?: UseWarnUnsavedProps,
	context?: UseWarnUnsavedContext,
): UseWarnUnsavedResult {
	const controller = useControllerContext(context)
	const resolvedProps = $derived(extract(props))

	const enabled = $derived.by(() => WarnUnsaved.getEnabled({
		fromProp: resolvedProps?.enabled,
		fromController: controller?.warnUnsaved,
	}))
	const confirm = $derived.by(() => WarnUnsaved.getConfirm({
		fromProp: resolvedProps?.confirm,
		fromController: controller?.warnUnsaved,
	}))

	let active = $state(false)
	let confirming = $state(false)

	const blocker = useRouteBlocker(() => ({
		shouldBlock: enabled && active,
	}), context)

	watch(() => blocker.state, (value) => {
		void WarnUnsaved.handleBlocked({
			blocked: value === RouteBlocker.State.Blocked,
			confirming,
			confirm,
			setConfirming: (next) => {
				confirming = next
			},
			proceed: blocker.proceed,
			reset: blocker.reset,
		})
	})

	return {
		get active() {
			return active
		},
		set active(value) {
			active = value
		},
		get state() {
			return WarnUnsaved.getState({ enabled, active, confirming })
		},
	}
}
