import type { Simplify } from 'type-fest'
import type { MaybeAccessor } from '../utils'
import type { UseRealtimeContextFromProps } from './context'
import { Subscribe } from '@ginjou/core'
import { extract, watch } from '../utils'
import { useRealtimeContext } from './context'

export type UseSubscribeProps<
	TPayload,
	TPageParam,
> = MaybeAccessor<
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
	const resolvedProps = $derived.by(() =>
		Subscribe.resolveProps<TPayload, TPageParam>(extract(props)),
	)
	const stop = watch(
		() => resolvedProps,
		() =>
			Subscribe.register<TPayload, TPageParam>({
				props: resolvedProps,
				realtime,
			}),
		{
			immediate: true,
		},
	)

	return {
		stop,
	}
}
