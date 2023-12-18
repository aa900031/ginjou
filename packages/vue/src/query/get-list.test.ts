import { describe, expect, it } from 'vitest'
import { waitFor } from '@testing-library/vue'
import { contexts } from '../../test/setup'
import { mountSetup, mountTestApp } from '../../test/mount'
import { useGetList } from '.'

describe('useGetList', () => {
	it('with root provided context', async () => {
		const { result: post } = mountTestApp(() => useGetList(
			{
				resource: 'posts',
			},
		))

		await waitFor(() => expect(post.isFetched.value).toBeTruthy())

		expect(post!.data.value?.data).toBeDefined()
	})

	it('with params context', async () => {
		const { result: { post } } = mountSetup(() => ({
			post: useGetList(
				{
					resource: 'posts',
				},
				contexts,
			),
		}))
		await waitFor(() => expect(post.isFetched.value).toBeTruthy())

		expect(post.data.value?.data).toBeDefined()
	})
})
