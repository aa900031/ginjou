import type { SetOptional } from 'type-fest'
import type { RealtimeEvent } from './event'
import type { PublishFn, Realtime } from './realtime'

export interface CreateEmitFnProps {
	realtime: Realtime | undefined
}

export type EmitEvent<
	TPayload,
> = SetOptional<
	RealtimeEvent<TPayload>,
	| 'date'
>

export type EmitFn<TPayload> = (
	event: EmitEvent<TPayload>,
) => void

export function createEmitFn<
	TPayload,
>(
	{
		realtime,
	}: CreateEmitFnProps,
): EmitFn<TPayload> {
	return function emitFn(event) {
		if (typeof realtime?.publish !== 'function')
			return

		const _event = resolveEvent(event)
		;(realtime.publish as PublishFn<TPayload>)(_event)
	}
}

function resolveEvent<
	TPayload,
>(
	event: EmitEvent<TPayload>,
): RealtimeEvent<TPayload> {
	return {
		...event,
		date: event.date ?? new Date(),
	}
}
