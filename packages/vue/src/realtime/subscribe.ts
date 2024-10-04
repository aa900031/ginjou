import type { Simplify } from 'type-fest'
import { computed, unref, watch } from 'vue-demi'
import { Subscribe } from '@ginjou/core'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseRealtimeContextFormProps } from './realtime'
import { useRealtimeContext } from './realtime'

export type UseSubscribeProps<
	TPayload,
> = ToMaybeRefs<
	Subscribe.Props<TPayload>
>

export type UseSubscribeContext = Simplify<
	& UseRealtimeContextFormProps
>

export interface UseSubscribeResult {
	stop: () => void
}

export function useSubscribe<
	TPayload,
>(
	props: UseSubscribeProps<TPayload>,
	context?: UseSubscribeContext,
): UseSubscribeResult {
	const realtime = useRealtimeContext(context)
	const resolvedProps = computed(() => Subscribe.resolveProps<TPayload>({
		channel: unref(props.channel),
		actions: unref(props.actions),
		callback: unref(props.callback),
		params: unref(props.params),
		meta: unref(props.meta),
		enabled: unref(props.enabled),
	}))

	const stop = watch(resolvedProps, (val, oldVal, onCleanup) => {
		const unsubscribe = Subscribe.register<TPayload>({
			props: val,
			realtime,
		})

		onCleanup(() => unsubscribe())
	})

	return {
		stop,
	}
}
