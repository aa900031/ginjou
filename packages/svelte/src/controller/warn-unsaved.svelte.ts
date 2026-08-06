import type { Simplify } from 'type-fest'
import type { UseRouteBlockerContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseControllerContextFromProps } from './context'
import { RouteBlocker, WarnUnsaved } from '@ginjou/core'
import { useRouteBlocker } from '../router'
import { extract, watch } from '../utils'
import { useControllerContext } from './context'

const DEFAULT_MESSAGE = 'You have unsaved changes. Are you sure you want to leave this page?'

// eslint-disable-next-line no-alert -- callers can override the native default
const defaultConfirm: WarnUnsaved.ConfirmFn = () => globalThis.confirm?.(DEFAULT_MESSAGE) ?? true

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
		defaultConfirm,
	}))

	let active = $state(false)
	let confirming = $state(false)

	// A predicate, not a bare `active`: every navigation reaches it now, and unsaved work only
	// wants the ones that take the page away. A change of query or hash leaves the route mounted.
	const blocker = useRouteBlocker(() => ({
		enabled,
		shouldBlock: (input): boolean => active && WarnUnsaved.isLeavingPath(input), // TODO: 思考是不是還要用 isLeavingPage
	}), context)

	watch(() => blocker.state, (value) => {
		void WarnUnsaved.handleBlocked({
			blocked: value === RouteBlocker.State.Blocked,
			confirming,
			confirm,
			setConfirming: (next) => {
				confirming = next
			},
			proceed: () => blocker.proceed?.(),
			reset: () => blocker.reset?.(),
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
