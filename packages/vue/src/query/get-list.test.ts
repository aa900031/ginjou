import { RealtimeAction } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { expectUnsubscribeCalled, MockRealtimes, subscribeFn } from '../../test/mock-realtime'
import { mountTestApp } from '../../test/mount'
import { useGetList } from './get-list'

describe('useGetList', () => {
	describe('subscribe', () => {
		it('should call realtime.subscribe', async () => {
			const { result } = mountTestApp(
				() => useGetList({
					resource: 'posts',
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
					filters: undefined,
					pagination: undefined,
					sorters: undefined,
					meta: undefined,
					resource: 'posts',
					type: 'list',
				},
			})
		})

		it('should call realtime.unscribe on unmount', async () => {
			const { result, unmount } = mountTestApp(
				() => useGetList({
					resource: 'posts',
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
				() => useGetList({
					resource: 'posts',
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
