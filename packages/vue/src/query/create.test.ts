import { RealtimeAction } from '@ginjou/core'
import { describe, expect, it, vi } from 'vitest'
import { ref, unref } from 'vue-demi'
import { MockFetchers, queryClient } from '../../test/mock-fetcher'
import { MockRealtimes, publishFn } from '../../test/mock-realtime'
import { mountTestApp } from '../../test/mount'
import { useCreateOne } from './create'

describe('useCreateOne', () => {
	describe('mutation callbacks', () => {
		it('should use the latest onSuccess callback', async () => {
			const oldOnSuccess = vi.fn()
			const onSuccess = vi.fn()
			const mutationOptions = ref({ onSuccess: oldOnSuccess })
			const { result } = mountTestApp(
				() => useCreateOne({ mutationOptions }),
				{
					queryClient,
					fetchers: MockFetchers,
				},
			)

			mutationOptions.value = { onSuccess }
			result.mutate({ resource: 'posts', params: {} })

			await vi.waitFor(() => {
				expect(onSuccess).toHaveBeenCalledOnce()
			})
			expect(oldOnSuccess).not.toHaveBeenCalled()
		})

		it('should use the latest onError callback', async () => {
			const oldOnError = vi.fn()
			const onError = vi.fn()
			const mutationOptions = ref({ onError: oldOnError })
			const { result } = mountTestApp(
				() => useCreateOne({ mutationOptions }),
				{
					queryClient,
					fetchers: {
						default: {
							...MockFetchers.default,
							createOne: () => Promise.reject(new Error('No')),
						},
					},
				},
			)

			mutationOptions.value = { onError }
			result.mutate({ resource: 'posts', params: {} })

			await vi.waitFor(() => {
				expect(onError).toHaveBeenCalledOnce()
			})
			expect(oldOnError).not.toHaveBeenCalled()
		})
	})

	describe('publish', () => {
		it('should call realtime.publish', async () => {
			const { result } = mountTestApp(
				() => useCreateOne(),
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
			const createOne = vi.fn(() => {
				throw new Error('No')
			})

			const { result } = mountTestApp(
				() => useCreateOne(),
				{
					queryClient,
					fetchers: {
						default: {
							...MockFetchers.default,
							createOne,
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
				expect(unref(result.isPending)).toBeFalsy()
			})

			expect(unref(result.isError)).toBeTruthy()
			expect(publishFn).not.toBeCalled()
			expect(createOne).toBeCalled()
		})
	})
})
