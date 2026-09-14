import type { RealtimeOption, SubscribeCallbackFn } from '../realtime'
import type { Invalidator } from './invalidate'
import { RealtimeMode } from '../realtime'
import { Target as InvalidateTarget } from './invalidate'

export interface RealtimeProps<
	TPayload,
> {
	realtime?: RealtimeOption.Input<TPayload>
}

export interface GetSubscribeChannelProps {
	resource: string
	realtimeOptions: RealtimeOption.Normalized<any>
}

export function getSubscribeChannel(
	{
		resource,
		realtimeOptions,
	}: GetSubscribeChannelProps,
): string {
	return realtimeOptions.channel
		?? `resources/${resource}`
}

export interface CreateSubscribeCallbackProps<
	TPayload,
> {
	invalidate: Invalidator
	getRealtimeOptions: () => RealtimeOption.Normalized<TPayload>
	getResource: () => string
	getFetcherName: () => string
}

export function createSubscribeCallback<
	TPayload,
>(
	{
		invalidate,
		getRealtimeOptions,
		getResource,
		getFetcherName,
	}: CreateSubscribeCallbackProps<TPayload>,
): SubscribeCallbackFn<TPayload> {
	return function subscribeCallback(event) {
		const options = getRealtimeOptions()

		if (options.mode === RealtimeMode.Auto) {
			const resource = getResource()
			const fetcherName = getFetcherName()

			invalidate(
				{
					invalidates: [InvalidateTarget.Resource],
					resource,
					fetcherName,
				},
			)
		}

		options.callback?.(event)
	}
}
