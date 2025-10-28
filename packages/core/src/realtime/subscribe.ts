import type { SetOptional, SetRequired, Simplify } from 'type-fest'
import type { Realtime, SubscribeProps } from './realtime'
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
		enabled?: boolean
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
		enabled: props.enabled ?? true,
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

	if (!realtime || !enabled)
		return noop

	const id = realtime.subscribe<TPayload>(rest)

	return () => {
		realtime!.unsubscribe?.(id)
	}
}
