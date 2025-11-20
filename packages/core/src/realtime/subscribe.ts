import type { SetOptional, SetRequired, Simplify } from 'type-fest'
import type { Realtime, SubscribeFn, SubscribeProps } from './realtime'
import { noop } from 'es-toolkit'
import { RealtimeAction } from './event'

export type Props<
	TPayload,
	TPageParam,
> = Simplify<
	& SetOptional<
		SubscribeProps<TPayload, TPageParam>,
		| 'actions'
		| 'callback'
	>
	& {
		enabled?: () => boolean
	}
>

export type ResolvedProps<
	TPayload,
	TPageParam,
> = SetRequired<
	Props<TPayload, TPageParam>,
	| 'actions'
	| 'callback'
>

const DEFAULT_ACTIONS = [RealtimeAction.Any]

export function resolveProps<
	TPayload,
	TPageParam,
>(
	props: Props<TPayload, TPageParam>,
): ResolvedProps<TPayload, TPageParam> {
	return {
		...props,
		actions: props.actions ?? DEFAULT_ACTIONS,
		callback: props.callback ?? noop,
	}
}

export interface RegisterProps<
	TPayload,
	TPageParam,
> {
	props: ResolvedProps<TPayload, TPageParam>
	realtime: Realtime | undefined
}

export function register<
	TPayload,
	TPageParam,
>(
	{
		props,
		realtime,
	}: RegisterProps<TPayload, TPageParam>,
): () => void {
	const {
		enabled,
		...rest
	} = props

	const isEnabled = enabled?.() ?? true

	if (!realtime || !isEnabled)
		return noop

	const id = (realtime.subscribe as SubscribeFn<TPayload, TPageParam>)(rest)

	return () => {
		realtime!.unsubscribe?.(id)
	}
}
