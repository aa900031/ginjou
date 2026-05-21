import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseRealtimeContextFromProps } from './context'
import { RealtimeOption } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useRealtimeContext } from './context'

export type UseRealtimeOptionsProps<
	TPayload,
>
	= | ToMaybeRefs<
		RealtimeOption.Input<TPayload>
	>
	| MaybeRef<
		RealtimeOption.Input<TPayload> | undefined
	>

export type UseRealtimeOptionsContext = Simplify<
	& UseRealtimeContextFromProps
>

export type UseRealtimeOptionsResult<
	TPayload,
> = Ref<
	RealtimeOption.Normalized<TPayload>
>

export function useRealtimeOptions<
	TPayload,
>(
	props?: UseRealtimeOptionsProps<TPayload>,
	context?: UseRealtimeOptionsContext,
): UseRealtimeOptionsResult<TPayload> {
	const realtime = useRealtimeContext(context)

	return computed(() => {
		const _props = unref(props)

		return RealtimeOption.merge(
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
