import { mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Create from './create.test.svelte'

describe('useCreateOne', () => {
	let component: Record<string, any> | undefined

	afterEach(async () => {
		if (component)
			await unmount(component)
		component = undefined
	})

	it('should create a record and expose the result', async () => {
		const createOne = vi.fn().mockResolvedValue({
			data: { id: 1, title: 'A' },
		})
		component = mount(Create, {
			target: document.body,
			props: { createOne },
		})

		document.querySelector('button')?.click()

		await vi.waitFor(() => {
			expect(createOne).toHaveBeenCalledWith(
				{
					fetcherName: 'default',
					invalidates: ['list', 'many'],
					params: { title: 'A' },
					resource: 'posts',
				},
				expect.anything(),
			)
			expect(document.querySelector('p')?.textContent).toBe('A')
		})
	})
})
