import type { ResolvedRealtimeOptions } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { MaybeAccessor } from '../utils'
import type { UseRealtimeContextFromProps } from './context'
import { RealtimeOption } from '@ginjou/core'
import { extract } from '../utils'
import { useRealtimeContext } from './context'

export type UseRealtimeProps<
	TPayload,
> = MaybeAccessor<
	RealtimeOption.Props<TPayload> | undefined
>

export type UseRealtimeOptionsContext = Simplify<
	& UseRealtimeContextFromProps
>

export interface UseRealtimeOptionsResult<
	TPayload,
> {
	readonly value: ResolvedRealtimeOptions<TPayload>
}

export function useRealtimeOptions<
	TPayload,
>(
	props?: UseRealtimeProps<TPayload>,
	context?: UseRealtimeOptionsContext,
): UseRealtimeOptionsResult<TPayload> {
	const realtime = useRealtimeContext(context)

	const value = $derived.by(() => {
		const resolvedProps = extract(props)
		return RealtimeOption.mergeOptions(
			resolvedProps
				? {
						mode: resolvedProps.mode,
						callback: resolvedProps.callback,
						channel: resolvedProps.channel,
						params: resolvedProps.params,
					}
				: undefined,
			realtime?.options,
		)
	})

	return {
		get value() {
			return value
		},
	}
}
