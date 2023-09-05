import { contexts } from '../test/setup'
import { mountSetup, mountTestApp } from '../test/mount'
import { useUpdate } from '.'

describe('useUpdate', () => {
	it('with root provided context', async () => {
		const { result: { update } } = mountTestApp(() => {
			return {
				update: useUpdate(),
			}
		})

		await update({ resource: 'posts', id: '1', params: { name: 'ya' } })

		expect(update).toBeDefined()
		expect(update.data.value?.data).toBeDefined()
		expect(update.isError.value).toBe(false)
	})

	it('with params context', async () => {
		const { result: { update } } = mountSetup(() => ({
			update: useUpdate(undefined, contexts),
		}))

		await update({ resource: 'posts', id: '1', params: { name: 'ya' } })

		expect(update).toBeDefined()
		expect(update.data.value?.data).toBeDefined()
		expect(update.isError.value).toBe(false)
	})
})
