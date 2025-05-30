import { RealtimeAction } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { MockRealtimes, publishFn } from '../../test/mock-realtime'
import { mountTestApp } from '../../test/mount'
import { useDeleteMany } from './delete-many'

describe('useDeleteMany', () => {
	describe('publish', () => {
		it('should call realtime.publish', async () => {
			const { result } = mountTestApp(
				() => useDeleteMany(),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: MockRealtimes,
				},
			)

			result.mutate({
				resource: 'posts',
				ids: ['1'],
			})

			await vi.waitFor(() => {
				expect(unref(result.isSuccess)).toBeTruthy()
			})

			expect(publishFn).toBeCalled()
			expect(publishFn).toBeCalledWith({
				action: RealtimeAction.Deleted,
				channel: 'resources/posts',
				date: expect.any(Date),
				meta: {
					fetcherName: 'default',
				},
				payload: {
					ids: ['1'],
				},
			})
		})

		it('should not call realtime.publish when mutation have exception', async () => {
			const deleteMany = vi.fn(() => {
				throw new Error('No')
			})

			const { result } = mountTestApp(
				() => useDeleteMany(),
				{
					queryClient,
					fetchers: {
						default: {
							...MockFetchers.default,
							deleteMany,
						},
					},
					realtime: MockRealtimes,
				},
			)

			result.mutate({
				resource: 'posts',
				ids: ['1'],
			})

			await vi.waitFor(() => {
				expect(unref(result.isPending)).toBeFalsy()
			})

			expect(unref(result.isError)).toBeTruthy()
			expect(publishFn).not.toBeCalled()
			expect(deleteMany).toBeCalled()
		})
	})
})
