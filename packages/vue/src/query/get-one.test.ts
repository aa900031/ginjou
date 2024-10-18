import { describe, expect, it, vi } from 'vitest'
import { unref } from 'vue-demi'
import { RealtimeAction } from '@ginjou/core'
import { mountTestApp } from '../../test/mount'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { MockRealtimes, expectUnsubscribeCalled, subscribeFn } from '../../test/mock-realtime'
import { useGetOne } from './get-one'

describe('useGetOne', () => {
	describe('subscribe', () => {
		it('should call realitme.subscribe', async () => {
			const { result } = mountTestApp(
				() => useGetOne({
					resource: 'posts',
					id: '1',
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
					id: '1',
					meta: undefined,
					resource: 'posts',
					type: 'one',
				},
			})
		})

		it('should call realtime.unscribe on unmount', async () => {
			const { result, unmount } = mountTestApp(
				() => useGetOne({
					resource: 'posts',
					id: '1',
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

		it('should not subscribe if queryOptions.enabled is false', async () => {
			const { result } = mountTestApp(
				() => useGetOne({
					resource: 'posts',
					id: '1',
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
