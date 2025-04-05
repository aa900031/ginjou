import { describe, expect, it, vi } from 'vitest'
import { unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
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
				}
			)

			await vi.waitFor(() => {
				expect(unref(result.isFetched)).toBeTruthy()
			})

			expect(unref(result.data)?.pages[0]).not.toBeUndefined()
			expect(unref(result.data)?.pageParams[0]).toBe(1)
			expect(unref(result.data)?.pages[0].pagination!.current).toBe(1)
		})
	})
})
