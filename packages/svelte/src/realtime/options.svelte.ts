import type { Simplify } from 'type-fest'
import type { MaybeAccessor } from '../utils'
import type { UseRealtimeContextFromProps } from './context'
import { RealtimeOption } from '@ginjou/core'
import { extract } from '../utils'
import { useRealtimeContext } from './context'

export type UseRealtimeOptionsProps<
	TPayload,
> = MaybeAccessor<
	RealtimeOption.Input<TPayload> | undefined
>

export type UseRealtimeOptionsContext = Simplify<
	& UseRealtimeContextFromProps
>

export interface UseRealtimeOptionsResult<
	TPayload,
> {
	readonly value: RealtimeOption.Normalized<TPayload>
}

export function useRealtimeOptions<
	TPayload,
>(
	props?: UseRealtimeOptionsProps<TPayload>,
	context?: UseRealtimeOptionsContext,
): UseRealtimeOptionsResult<TPayload> {
	const realtime = useRealtimeContext(context)

	const value = $derived.by(() => {
		const resolvedProps = extract(props)
		return RealtimeOption.merge(
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
