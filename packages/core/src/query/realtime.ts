import type { QueryClient } from '@tanstack/query-core'
import type { RealtimeOptions, ResolvedRealtimeOptions, SubscribeCallbackFn } from '../realtime'
import { RealtimeMode } from '../realtime/mode'
import { InvalidateTarget, triggerInvalidate } from './invalidate'

export interface RealtimeProps<
	TPayload,
> {
	realtime?: RealtimeOptions<TPayload>
}

export interface GetSubscribeChannelProps {
	resource: string
	realtimeOptions: ResolvedRealtimeOptions<any>
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
	queryClient: QueryClient
	getRealtimeOptions: () => ResolvedRealtimeOptions<TPayload>
	getResource: () => string
	getFetcherName: () => string
}

export function createSubscribeCallback<
	TPayload,
>(
	{
		queryClient,
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

			triggerInvalidate(
				{
					resource,
					fetcherName,
					invalidateFilters: {
						type: 'active',
						refetchType: 'active',
					},
					invalidateOptions: {
						cancelRefetch: false,
					},
				},
				InvalidateTarget.Resource,
				queryClient,
			)
		}

		options.callback?.(event)
	}
}
