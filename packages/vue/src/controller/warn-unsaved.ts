import type { Simplify } from 'type-fest'
import type { ComputedRef, Ref } from 'vue-demi'
import type { UseRouteBlockerContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseControllerContextFromProps } from './context'
import { RouteBlocker, WarnUnsaved } from '@ginjou/core'
import { computed, ref, unref, watch } from 'vue-demi'
import { useRouteBlocker } from '../router'
import { useControllerContext } from './context'

export type UseWarnUnsavedProps = ToMaybeRefs<
	WarnUnsaved.Props
>

export type UseWarnUnsavedContext = Simplify<
	& UseControllerContextFromProps
	& UseRouteBlockerContext
>

export interface UseWarnUnsavedResult {
	active: Ref<boolean>
	state: ComputedRef<WarnUnsaved.StateValues>
}

export function useWarnUnsaved(
	props?: UseWarnUnsavedProps,
	context?: UseWarnUnsavedContext,
): UseWarnUnsavedResult {
	const controller = useControllerContext(context)

	const enabled = computed(() => WarnUnsaved.getEnabled({
		fromProp: unref(props?.enabled),
		fromController: controller?.warnUnsaved,
	}))
	const confirm = computed(() => WarnUnsaved.getConfirm({
		fromProp: unref(props?.confirm),
		fromController: controller?.warnUnsaved,
	}))

	const active = ref(false)
	const confirming = ref(false)
	const state = computed(() => WarnUnsaved.getState({
		enabled: enabled.value,
		active: active.value,
		confirming: confirming.value,
	}))
	const blocker = useRouteBlocker({
		shouldBlock: computed(() => enabled.value && active.value),
	}, context)

	watch(blocker.state, (value) => {
		void WarnUnsaved.handleBlocked({
			blocked: value === RouteBlocker.State.Blocked,
			confirming: confirming.value,
			confirm: confirm.value,
			setConfirming: (next) => {
				confirming.value = next
			},
			proceed: blocker.proceed,
			reset: blocker.reset,
		})
	})

	return {
		active,
		state,
	}
}
