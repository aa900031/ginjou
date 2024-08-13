import { EmitPublish } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import type { UseRealtimeContextFormProps } from './realtime'
import { useRealtimeContext } from './realtime'

export type UsePublishContext = Simplify<
	& UseRealtimeContextFormProps
>

export function usePublish(
	context?: UsePublishContext,
) {
	const realtime = useRealtimeContext(context)

	return EmitPublish.createEmitFn({
		realtime,
	})
}
