import type { SetOptional, SetRequired, Simplify } from 'type-fest'
import type { Realtime, SubscribeFn, SubscribeProps } from './realtime'
import { noop } from 'es-toolkit'
import { RealtimeAction } from './event'

export type Props<
	TPayload,
> = Simplify<
	& SetOptional<
		SubscribeProps<TPayload>,
		| 'actions'
		| 'callback'
	>
	& {
		enabled?: () => boolean
	}
>

export type ResolvedProps<
	TPayload,
> = SetRequired<
	Props<TPayload>,
	| 'actions'
	| 'callback'
>

const DEFAULT_ACTIONS = [RealtimeAction.Any]

export function resolveProps<
	TPayload,
>(
	props: Props<TPayload>,
): ResolvedProps<TPayload> {
	return {
		...props,
		actions: props.actions ?? DEFAULT_ACTIONS,
		callback: props.callback ?? noop,
	}
}

export interface RegisterProps<
	TPayload,
> {
	props: ResolvedProps<TPayload>
	realtime: Realtime | undefined
}

export function register<
	TPayload,
>(
	{
		props,
		realtime,
	}: RegisterProps<TPayload>,
): () => void {
	const {
		enabled,
		...rest
	} = props

	const isEnabled = enabled?.() ?? true

	if (!realtime || !isEnabled)
		return noop

	const id = (realtime.subscribe as SubscribeFn<TPayload>)(rest)

	return () => {
		realtime!.unsubscribe?.(id)
	}
}
