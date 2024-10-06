import { RealtimeMode } from './mode'
import type { RealtimeContextOptions, RealtimeOptions, ResolvedRealtimeOptions } from './realtime'

export type Props<
	TPayload,
> = RealtimeOptions<TPayload>

export function mergeOptions<
	TPayload,
>(
	options: RealtimeOptions<TPayload> | undefined,
	contextOptions: RealtimeContextOptions<TPayload> | undefined,
): ResolvedRealtimeOptions<TPayload> {
	return {
		mode: options?.mode ?? contextOptions?.mode ?? RealtimeMode.Auto,
		callback: (event) => {
			options?.callback?.(event)
			contextOptions?.callback?.(event)
		},
		channel: options?.channel,
		params: contextOptions?.params != null || options?.params != null
			? {
					...contextOptions?.params,
					...options?.params,
				}
			: undefined,
	}
}
