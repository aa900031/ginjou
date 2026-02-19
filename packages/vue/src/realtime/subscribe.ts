import type { Simplify } from 'type-fest'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseRealtimeContextFromProps } from './context'
import { Subscribe } from '@ginjou/core'
import { computed, unref, watch } from 'vue-demi'
import { useRealtimeContext } from './context'

export type UseSubscribeProps<
	TPayload,
	TPageParam,
> = ToMaybeRefs<
	Subscribe.Props<TPayload, TPageParam>
>

export type UseSubscribeContext = Simplify<
	& UseRealtimeContextFromProps
>

export interface UseSubscribeResult {
	stop: () => void
}

export function useSubscribe<
	TPayload = unknown,
	TPageParam = unknown,
>(
	props: UseSubscribeProps<TPayload, TPageParam>,
	context?: UseSubscribeContext,
): UseSubscribeResult {
	const realtime = useRealtimeContext(context)
	const resolvedProps = computed(() =>
		Subscribe.resolveProps<TPayload, TPageParam>(
			{
				channel: unref(props.channel),
				actions: unref(props.actions),
				callback: unref(props.callback),
				params: unref(props.params),
				meta: unref(props.meta),
				enabled: unref(props.enabled),
			},
		))

	const stop = watch(resolvedProps, (val, oldVal, onCleanup) => {
		const unsubscribe = Subscribe.register<TPayload, TPageParam>({
			props: val,
			realtime,
		})

		onCleanup(() => unsubscribe())
	}, {
		immediate: true,
	})

	return {
		stop,
	}
}
