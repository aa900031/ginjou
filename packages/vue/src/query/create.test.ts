import { describe, expect, it } from 'vitest'
import { contexts } from '../../test/setup'
import { mountSetup, mountTestApp } from '../../test/mount'
import { useCreate } from '.'

describe('useCreate', () => {
	it('with root provided context', async () => {
		const { result: { create } } = mountTestApp(() => {
			return {
				create: useCreate(),
			}
		})

		await create({ resource: 'posts', params: { id: '1' } })

		expect(create).toBeDefined()
		expect(create.data.value?.data).toBeDefined()
		expect(create.isError.value).toBe(false)
	})

	it('with params context', async () => {
		const { result: { create } } = mountSetup(() => ({
			create: useCreate(undefined, contexts),
		}))

		await create({ resource: 'posts', params: { id: '1' } })

		expect(create).toBeDefined()
		expect(create.data.value?.data).toBeDefined()
		expect(create.isError.value).toBe(false)
	})
})
