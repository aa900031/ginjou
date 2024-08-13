import type { SetOptional, Simplify } from 'type-fest'
import type { Realtime } from './realtime'
import { RealtimeAction } from './realtime'
import type { SubscribeCallbackFn, SubscribeProps } from './subscribe'

export type Props<
	TPayload,
> = Simplify<
	& SetOptional<
		SubscribeProps<TPayload>,
		| 'actions'
		| 'callback'
	>
	& {
		enabled?: boolean
	}
>

export interface RegisterProps<
	TPayload,
> {
	props: Props<TPayload>
	realtime: Realtime | undefined
}

function noop() {

}

const DEFAULT_ACTIONS = [RealtimeAction.Any]

export function register<
	TPayload,
>(
	{
		props,
		realtime,
	}: RegisterProps<TPayload>,
): () => void {
	const {
		enabled = true,
		actions = DEFAULT_ACTIONS,
		callback: callbackFromSubscribeProps,
	} = props

	if (!enabled || !realtime)
		return noop

	const callback: SubscribeCallbackFn<TPayload> = (event) => {
		callbackFromSubscribeProps?.(event)
	}

	const id = realtime.subscribe<TPayload>({
		...props,
		callback,
		actions,
	})

	return () => {
		realtime!.unsubscribe?.(id)
	}
}
