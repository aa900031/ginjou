import type { Simplify } from 'type-fest'
import type { UseRealtimeContextFormProps } from './context'
import { Publish } from '@ginjou/core'
import { useRealtimeContext } from './context'

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
