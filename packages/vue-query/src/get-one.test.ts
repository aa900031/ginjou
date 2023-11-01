import { describe, expect, it } from 'vitest'
import { waitFor } from '@testing-library/vue'
import { contexts } from '../test/setup'
import { mountSetup, mountTestApp } from '../test/mount'
import { useGetOne } from '.'

describe('useGetOne', () => {
	it('with root provided context', async () => {
		const { result: post } = mountTestApp(() => useGetOne(
			{
				resource: 'posts',
				id: '1',
			},
		))

		await waitFor(() => expect(post.isFetched.value).toBeTruthy())

		expect(post!.data.value?.data).toBeDefined()
	})

	it('with params context', async () => {
		const { result: { post } } = mountSetup(() => ({
			post: useGetOne(
				{
					resource: 'posts',
					id: '1',
				},
				contexts,
			),
		}))
		await waitFor(() => expect(post.isFetched.value).toBeTruthy())

		expect(post.data.value?.data).toBeDefined()
	})
})
