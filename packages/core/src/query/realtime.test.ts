import { QueryClient } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { RealtimeMode } from '../realtime'
import { createInvalidator } from './invalidate'
import { createSubscribeCallback } from './realtime'

describe('createSubscribeCallback', () => {
	it('invalidates only active resource queries in auto mode', async () => {
		const queryClient = new QueryClient()
		const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')
		const callback = vi.fn()
		const subscribeCallback = createSubscribeCallback({
			invalidate: createInvalidator({
				getFetcherName: () => undefined,
				getInvalidates: () => undefined,
				getResource: () => undefined,
				queryClient,
			}),
			getRealtimeOptions: () => ({ mode: RealtimeMode.Auto, callback }),
			getResource: () => 'posts',
			getFetcherName: () => 'default',
		})

		subscribeCallback({ action: 'updated' } as any)
		await vi.waitFor(() => expect(invalidateQueries).toHaveBeenCalled())

		expect(invalidateQueries).toHaveBeenCalledWith(
			{ queryKey: ['default', 'posts'], type: 'active', refetchType: 'active' },
			{ cancelRefetch: false },
		)
		expect(callback).toHaveBeenCalledOnce()
	})
})
