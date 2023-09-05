import { waitFor } from '@testing-library/vue'
import { mountSetup, mountTestApp } from '../test/mount'
import { contexts } from '../test/setup'
import { useGetInfiniteList } from '.'

describe('useGetInfiniteList', () => {
	it('with root provided context', async () => {
		const { result: post } = mountTestApp(() => useGetInfiniteList(
			{
				resource: 'posts',
			},
		))

		await waitFor(() => expect(post.isFetched.value).toBeTruthy())

		expect(post!.data.value?.pages[0]?.data).toBeDefined()
	})

	it('with params context', async () => {
		const { result: { post } } = mountSetup(() => ({
			post: useGetInfiniteList(
				{
					resource: 'posts',
				},
				contexts,
			),
		}))
		await waitFor(() => expect(post.isFetched.value).toBeTruthy())

		expect(post.data.value?.pages[0]?.data).toBeDefined()
	})
})
