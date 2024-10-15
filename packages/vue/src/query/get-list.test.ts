import { describe, expect, it, vi } from 'vitest'
import { RealtimeAction, type SubscribeFn } from '@ginjou/core'
import { unref } from 'vue'
import { mountTestApp } from '../../test/mount'
import { MockFetchers, queryClient } from '../../test/setup'
import { useGetList } from './get-list'

describe('useGetList', () => {
	describe('subscribe', () => {
		it('should call realtime.subscribe', async () => {
			const subscribe = vi.fn<Parameters<SubscribeFn>, ReturnType<SubscribeFn>>()

			const { result } = mountTestApp(
				() => useGetList({
					resource: 'posts',
				}),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: {
						subscribe,
					} as any,
				},
			)

			await vi.waitFor(() => {
				expect(unref(result.isFetched)).toBeTruthy()
			})

			expect(subscribe).toBeCalled()
			expect(subscribe).toBeCalledWith({
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
	})
})
