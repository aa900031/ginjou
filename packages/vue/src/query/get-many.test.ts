import { RealtimeAction, SubscribeType } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { expectUnsubscribeCalled, MockRealtimes, subscribeFn } from '../../test/mock-realtime'
import { mountTestApp } from '../../test/mount'
import { useGetMany } from './get-many'

describe('useGetMany', () => {
	describe('subscribe', () => {
		it('should call realtime.subscribe', async () => {
			const { result } = mountTestApp(
				() => useGetMany({
					resource: 'posts',
					ids: ['1', '2'],
				}),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: MockRealtimes,
				},
			)

			await vi.waitFor(() => {
				expect(unref(result.isFetched)).toBeTruthy()
			})

			expect(subscribeFn).toBeCalled()
			expect(subscribeFn).toBeCalledWith({
				channel: 'resources/posts',
				actions: [RealtimeAction.Any],
				callback: expect.any(Function),
				meta: undefined,
				params: {
					ids: ['1', '2'],
					meta: undefined,
					resource: 'posts',
					type: SubscribeType.Many,
				},
			})
		})

		it('should call realtime.unscribe on unmount', async () => {
			const { result, unmount } = mountTestApp(
				() => useGetMany({
					resource: 'posts',
					ids: ['1', '2'],
				}),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: MockRealtimes,
				},
			)

			await vi.waitFor(() => {
				expect(unref(result.isFetched)).toBeTruthy()
			})

			unmount()

			expectUnsubscribeCalled()
		})

		it('should not call realtime.subscribe if queryOptions.enabled is false', async () => {
			const { result } = mountTestApp(
				() => useGetMany({
					resource: 'posts',
					ids: ['1', '2'],
					queryOptions: {
						enabled: false,
					},
				}),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: MockRealtimes,
				},
			)

			expect(unref(result.isFetched)).toBeFalsy()
			expect(subscribeFn).not.toBeCalled()
		})
	})
})
