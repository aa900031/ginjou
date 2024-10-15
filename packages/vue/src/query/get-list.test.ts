import { describe, expect, it, vi } from 'vitest'
import type { SubscribeFn, UnsubscribeFn } from '@ginjou/core'
import { RealtimeAction } from '@ginjou/core'
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

		it('should call realtime.unscribe on unmount', async () => {
			const KEY_FOR_SUB = 'key-for-subscribe'
			const subscribe = vi.fn<Parameters<SubscribeFn>, ReturnType<SubscribeFn>>(() => KEY_FOR_SUB)
			const unsubscribe = vi.fn<Parameters<UnsubscribeFn>, ReturnType<UnsubscribeFn>>()

			const { result, unmount } = mountTestApp(
				() => useGetList({
					resource: 'posts',
				}),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: {
						subscribe,
						unsubscribe,
					} as any,
				},
			)

			await vi.waitFor(() => {
				expect(unref(result.isFetched)).toBeTruthy()
			})

			unmount()

			expect(unsubscribe).toBeCalledWith(KEY_FOR_SUB)
			expect(unsubscribe).toBeCalledTimes(1)
		})

		it('should not subscribe if queryOptions.enabled is false', async () => {
			const subscribe = vi.fn<Parameters<SubscribeFn>, ReturnType<SubscribeFn>>()

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
					realtime: {
						subscribe,
					} as any,
				},
			)

			expect(unref(result.isFetched)).toBeFalsy()
			expect(subscribe).not.toBeCalled()
		})
	})
})
