import { waitFor } from '@testing-library/vue'
import { contexts } from '../test/setup'
import { mountSetup, mountTestApp } from '../test/mount'
import { useCustom } from '.'

describe('useCustom', () => {
	it('with root provided context', async () => {
		const { result: { custom } } = mountTestApp(() => {
			return {
				custom: useCustom({
					url: 'https://google.com',
					method: 'get',
				}),
			}
		})

		await waitFor(() => expect(custom.isFetched.value).toBeTruthy())

		expect(custom!.data.value?.data).toBeDefined()
	})

	it('with params context', async () => {
		const { result: { custom } } = mountSetup(() => ({
			custom: useCustom(
				{
					url: 'https://google.com',
					method: 'get',
				},
				contexts,
			),
		}))
		await waitFor(() => expect(custom.isFetched.value).toBeTruthy())

		expect(custom.data.value?.data).toBeDefined()
	})
})
