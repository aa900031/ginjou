import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { MockRealtimes, subscribeFn } from '../../test/mock-realtime'
import { mountTestApp } from '../../test/mount'
import { useGetInfiniteList } from './get-infinite-list'

describe('useGetList', () => {
	describe('basic', () => {
		it('should get data', async () => {
			const { result } = mountTestApp(
				() => useGetInfiniteList({
					resource: 'posts',
					pagination: {
						current: 1,
						perPage: 10,
					},
				}),
				{
					queryClient,
					fetchers: MockFetchers,
				},
			)

			await vi.waitFor(() => {
				expect(unref(result.isFetched)).toBeTruthy()
			})

			expect(unref(result.data)?.pages[0]).not.toBeUndefined()
			expect(unref(result.data)?.pageParams[0]).toBe(1)
			expect(unref(result.data)?.pages[0].pagination!.current).toBe(1)
		})

		it('should fetch and subscribe when computed queryOptions.enabled becomes true', async () => {
			const isEnabled = ref(false)
			const queryOptions = computed(() => ({
				enabled: unref(isEnabled),
			}))

			const { result } = mountTestApp(
				() => useGetInfiniteList({
					resource: 'posts',
					pagination: {
						current: 1,
						perPage: 10,
					},
					queryOptions,
				}),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: MockRealtimes,
				},
			)

			expect(unref(result.isFetched)).toBeFalsy()
			expect(subscribeFn).not.toBeCalled()

			isEnabled.value = true
			await nextTick()

			await vi.waitFor(() => {
				expect(unref(result.isFetched)).toBeTruthy()
			})
			expect(subscribeFn).toBeCalled()
		})
	})
})
