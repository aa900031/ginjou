import type { SetOptional } from 'type-fest'
import type { Realtime, RealtimeEvent } from './realtime'

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
	event: EmitEvent<TPayload>
) => void

export function createEmitFn<
	TPayload,
>(
	{
		realtime,
	}: CreateEmitFnProps,
): EmitFn<TPayload> {
	return function emitFn(event) {
		const _event = resolveEvent(event)
		realtime?.publish?.(_event)
	}
}

function resolveEvent<
	TPayload,
>(
	event: SetOptional<
		RealtimeEvent<TPayload>,
		| 'date'
	>,
): RealtimeEvent {
	return {
		...event,
		date: event.date ?? new Date(),
	}
}
