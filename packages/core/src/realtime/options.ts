import type { SetRequired, Simplify } from 'type-fest'
import type { RealtimeModeValue } from './mode'
import type { SubscribeCallbackFn } from './realtime'
import { RealtimeMode } from './mode'

export interface Input<
	TPayload,
> {
	mode?: RealtimeModeValue
	callback?: SubscribeCallbackFn<TPayload>
	channel?: string
	params?: Record<string, unknown>
}

export type Context<
	TPayload,
> = Simplify<
	& Omit<
		Input<TPayload>,
		| 'channel'
	>
>

export type Normalized<
	TPayload,
> = SetRequired<
	Input<TPayload>,
	| 'mode'
>

export function merge<
	TPayload,
>(
	options: Input<TPayload> | undefined,
	contextOptions: Context<TPayload> | undefined,
): Normalized<TPayload> {
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
