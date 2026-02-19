import type { ResolvedRealtimeOptions } from '@ginjou/core'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseRealtimeContextFromProps } from './context'
import { RealtimeOption } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useRealtimeContext } from './context'

export type UseRealtimeProps<
	TPayload,
>
	= | ToMaybeRefs<
		RealtimeOption.Props<TPayload>
	>
	| MaybeRef<
		RealtimeOption.Props<TPayload> | undefined
	>

export type UseRealtimeOptionsContext = Simplify<
	& UseRealtimeContextFromProps
>

export type UseRealtimeOptionsResult<
	TPayload,
>
	= Ref<ResolvedRealtimeOptions<TPayload>>

export function useRealtimeOptions<
	TPayload,
>(
	props?: UseRealtimeProps<TPayload>,
	context?: UseRealtimeOptionsContext,
): UseRealtimeOptionsResult<TPayload> {
	const realtime = useRealtimeContext(context)

	return computed(() => {
		const _props = unref(props)

		return RealtimeOption.mergeOptions(
			_props
				? {
						mode: unref(_props.mode),
						callback: unref(_props.callback),
						channel: unref(_props.channel),
						params: unref(_props.params),
					}
				: undefined,
			realtime?.options,
		)
	})
}
