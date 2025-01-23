import type { Simplify } from 'type-fest'
import type { ToMaybeReadables } from '../utils/store'
import type { UseRealtimeContextFormProps } from './context'
import { Subscribe } from '@ginjou/core'
import { derived } from 'svelte/store'
import { toReadable } from '../utils/store'
import { useRealtimeContext } from './context'

export type UseSubscribeProps<
	TPayload,
> = ToMaybeReadables<
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
	const resolvedProps = derived([
		toReadable(props.channel),
		toReadable(props.actions),
		toReadable(props.callback),
		toReadable(props.params),
		toReadable(props.meta),
		toReadable(props.enabled),
	], ([
		channel,
		actions,
		callback,
		params,
		meta,
		enabled,
	]) => Subscribe.resolveProps<TPayload>({
		channel,
		actions,
		callback,
		params,
		meta,
		enabled,
	}))

	const stop = resolvedProps.subscribe((val) => {
		const unsubscribe = Subscribe.register<TPayload>({
			props: val,
			realtime,
		})

		return () => {
			unsubscribe()
		}
	})

	return {
		stop,
	}
}
