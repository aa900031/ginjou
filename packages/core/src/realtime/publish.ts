import type { RealtimeEvent } from './realtime'

export type PublishFn = <
	TPayload,
>(
	event: RealtimeEvent<TPayload>
) => void
