import type { Simplify } from 'type-fest'
import { unref, watchEffect } from 'vue-demi'
import { AddSubscribe } from '@ginjou/core'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseRealtimeContextFormProps } from './realtime'
import { useRealtimeContext } from './realtime'

export type UseSubscribeProps<
	TPayload,
> = ToMaybeRefs<
	AddSubscribe.Props<TPayload>
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

	const stop = watchEffect((onCleanup) => {
		const unsubscribe = AddSubscribe.register({
			props: {
				channel: unref(props.channel),
				actions: unref(props.actions),
				callback: unref(props.callback),
				params: unref(props.params),
				meta: unref(props.meta),
				enabled: unref(props.enabled),
			},
			realtime,
		})

		onCleanup(() => unsubscribe())
	})

	return {
		stop,
	}
}
