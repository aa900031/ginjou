import { contexts } from '../test/setup'
import { mountSetup, mountTestApp } from '../test/mount'
import { useDelete } from '.'

describe('useDelete', () => {
	it('with root provided context', async () => {
		const { result: { deleteOne } } = mountTestApp(() => {
			return {
				deleteOne: useDelete(),
			}
		})

		await deleteOne({ resource: 'posts', id: '1' })

		expect(deleteOne).toBeDefined()
		expect(deleteOne.data.value?.data).toBeDefined()
		expect(deleteOne.isError.value).toBe(false)
	})

	it('with params context', async () => {
		const { result: { deleteOne } } = mountSetup(() => ({
			deleteOne: useDelete(undefined, contexts),
		}))

		await deleteOne({ resource: 'posts', id: '1' })

		expect(deleteOne).toBeDefined()
		expect(deleteOne.data.value?.data).toBeDefined()
		expect(deleteOne.isError.value).toBe(false)
	})
})
