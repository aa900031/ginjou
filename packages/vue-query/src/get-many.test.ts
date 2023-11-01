import { describe, expect, it } from 'vitest'
import { waitFor } from '@testing-library/vue'
import { contexts } from '../test/setup'
import { mountSetup, mountTestApp } from '../test/mount'
import { useGetMany } from '.'

describe('useGetMany', () => {
	it('with root provided context', async () => {
		const { result: post } = mountTestApp(() => useGetMany(
			{
				resource: 'posts',
				ids: ['1'],
			},
		))

		await waitFor(() => expect(post.isFetched.value).toBeTruthy())

		expect(post!.data.value?.data).toBeDefined()
	})

	it('with params context', async () => {
		const { result: { post } } = mountSetup(() => ({
			post: useGetMany(
				{
					resource: 'posts',
					ids: ['1'],
				},
				contexts,
			),
		}))

		await waitFor(() => expect(post.isFetched.value).toBeTruthy())

		expect(post.data.value?.data).toBeDefined()
	})
})
