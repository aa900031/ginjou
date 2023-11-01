import { describe, expect, it } from 'vitest'
import { contexts } from '../test/setup'
import { mountSetup, mountTestApp } from '../test/mount'
import { useCustomMutation } from '.'

describe('useCustomMutation', () => {
	it('with root provided context', async () => {
		const { result: { custom } } = mountTestApp(() => {
			return {
				custom: useCustomMutation(),
			}
		})

		await custom({ url: 'https://google.com', method: 'get', payload: { ya: true } })

		expect(custom).toBeDefined()
		expect(custom.data.value?.data).toBeDefined()
		expect(custom.isError.value).toBe(false)
	})

	it('with params context', async () => {
		const { result: { custom } } = mountSetup(() => ({
			custom: useCustomMutation(undefined, contexts),
		}))

		await custom({ url: 'https://google.com', method: 'get', payload: { ya: true } })

		expect(custom).toBeDefined()
		expect(custom.data.value?.data).toBeDefined()
		expect(custom.isError.value).toBe(false)
	})
})
