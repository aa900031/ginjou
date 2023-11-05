import { describe, expect, it, vi } from 'vitest'
import { mergeSaveOptions } from './save'

describe('save: mergeSaveOptions', () => {
	it('should merge only onSuccess', () => {
		const onSuccess1 = vi.fn()
		const result = mergeSaveOptions(
			{ onSuccess: onSuccess1 },
		)
		expect(result.onSuccess).toBeDefined()
		expect(result.onError).toBeUndefined()
	})

	it('should merge undefined, and return empty obj', () => {
		const result = mergeSaveOptions()
		expect(result).toEqual({})
	})

	it('should merged and can call callback once', async () => {
		const onSuccess1 = vi.fn().mockImplementation(async () => {})
		const onSuccess2 = vi.fn().mockImplementation(async () => {})
		const options = mergeSaveOptions(
			{ onSuccess: onSuccess1 },
			{ onSuccess: onSuccess2 },
		)
		await options.onSuccess!(1, 1)
		expect(onSuccess1).toBeCalledTimes(1)
		expect(onSuccess1).toBeCalledWith(1, 1)
		expect(onSuccess2).toBeCalledTimes(0)
	})

	it('should merged and skip break after first called callback', async () => {
		const onSuccess1 = vi.fn().mockImplementation(async () => true)
		const onSuccess2 = vi.fn().mockImplementation(async () => {})
		const options = mergeSaveOptions(
			{ onSuccess: onSuccess1 },
			{ onSuccess: onSuccess2 },
		)
		await options.onSuccess!(1, 1)
		expect(onSuccess1).toBeCalledTimes(1)
		expect(onSuccess1).toBeCalledWith(1, 1)
		expect(onSuccess2).toBeCalledTimes(1)
		expect(onSuccess2).toBeCalledWith(1, 1)
	})
})
