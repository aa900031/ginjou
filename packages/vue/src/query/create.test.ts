import { RealtimeAction } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { MockRealtimes, publishFn } from '../../test/mock-realtime'
import { mountTestApp } from '../../test/mount'
import { useCreate } from './create'

describe('useCreate', () => {
	describe('publish', () => {
		it('should call realtime.publish', async () => {
			const { result } = mountTestApp(
				() => useCreate(),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: MockRealtimes,
				},
			)

			result.mutate({
				resource: 'posts',
				params: {
					title: 'Necessitatibus necessitatibus id et cupiditate provident est qui amet.',
					slug: 'ut-ad-et',
					content: 'Modifyed',
					categoryId: 1,
					status: 'active',
					userId: 5,
					tags: [16, 31, 45],
					nested: {
						title: 'Necessitatibus necessitatibus id et cupiditate provident est qui amet.',
					},
				},
			})

			await vi.waitFor(() => {
				expect(unref(result.isSuccess)).toBeTruthy()
			})

			expect(publishFn).toBeCalled()
			expect(publishFn).toBeCalledWith({
				action: RealtimeAction.Created,
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
			const create = vi.fn(() => {
				throw new Error('No')
			})

			const { result } = mountTestApp(
				() => useCreate(),
				{
					queryClient,
					fetchers: {
						default: {
							...MockFetchers.default,
							create,
						},
					},
					realtime: MockRealtimes,
				},
			)

			result.mutate({
				resource: 'posts',
				params: {
					title: 'Necessitatibus necessitatibus id et cupiditate provident est qui amet.',
					slug: 'ut-ad-et',
					content: 'Modifyed',
					categoryId: 1,
					status: 'active',
					userId: 5,
					tags: [16, 31, 45],
					nested: {
						title: 'Necessitatibus necessitatibus id et cupiditate provident est qui amet.',
					},
				},
			})

			await vi.waitFor(() => {
				expect(unref(result.isLoading)).toBeFalsy()
			})

			expect(unref(result.isError)).toBeTruthy()
			expect(publishFn).not.toBeCalled()
			expect(create).toBeCalled()
		})
	})
})
