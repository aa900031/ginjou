import { RealtimeAction } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { expectUnsubscribeCalled, MockRealtimes, subscribeFn } from '../../test/mock-realtime'
import { mountTestApp } from '../../test/mount'
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

			expect(subscribeFn).toHaveBeenCalled()
			expect(subscribeFn).toHaveBeenCalledWith({
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
			expect(subscribeFn).not.toHaveBeenCalled()
		})

		it('should fetch and subscribe when computed queryOptions.enabled becomes true', async () => {
			const isEnabled = ref(false)
			const queryOptions = computed(() => ({
				enabled: unref(isEnabled),
			}))

			const { result } = mountTestApp(
				() => useGetOne({
					resource: 'posts',
					id: '1',
					queryOptions,
				}),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: MockRealtimes,
				},
			)

			expect(unref(result.isFetched)).toBeFalsy()
			expect(subscribeFn).not.toHaveBeenCalled()

			isEnabled.value = true
			await nextTick()

			await vi.waitFor(() => {
				expect(unref(result.isFetched)).toBeTruthy()
			})
			expect(subscribeFn).toHaveBeenCalled()
		})
	})
})
