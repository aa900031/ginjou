import { describe, expect, it, vi } from 'vitest'
import { unref } from 'vue'
import { RealtimeAction } from '@ginjou/core'
import { mountTestApp } from '../../test/mount'
import { MockFetchers, queryClient } from '../../test/setup'
import { useUpdate } from './update'

describe('useUpdate', () => {
	describe('publish', () => {
		it('should call realtime.publish', async () => {
			const publish = vi.fn()
			const subscribe = vi.fn()

			const { result } = mountTestApp(
				() => useUpdate(),
				{
					queryClient,
					fetchers: MockFetchers,
					realtime: {
						subscribe,
						publish,
					},
				},
			)

			result.mutate({
				resource: 'posts',
				id: '1',
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

			expect(publish).toBeCalled()
			expect(publish).toBeCalledWith({
				action: RealtimeAction.Updated,
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
	})
})
