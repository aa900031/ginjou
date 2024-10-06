import { Publish } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseRealtimeContextFormProps } from './realtime'
import { useRealtimeContext } from './realtime'

export type UsePublishContext = Simplify<
	& UseRealtimeContextFormProps
>

export function usePublish<
	TPayload,
>(
	context?: UsePublishContext,
): Publish.EmitFn<TPayload> {
	const realtime = useRealtimeContext(context)

	return Publish.createEmitFn({
		realtime,
	})
}
