import { describe, expect, it } from 'vitest'
import { box, unbox } from './box'

describe('box', () => {
	it('should create a readonly box from a getter function', () => {
		let value = 1
		const result = box(() => value)

		expect(result.value).toBe(1)

		value = 2

		expect(result.value).toBe(2)
	})

	it('should create a writable box from get and set accessors', () => {
		let value = 1
		const result = box({
			get: () => value,
			set: (nextValue) => {
				value = nextValue
			},
		})

		result.value = 4

		expect(value).toBe(4)
		expect(result.value).toBe(4)
	})
})

describe('unbox', () => {
	it('should read the current value from a box', () => {
		let value = 2
		const result = box(() => value)

		expect(unbox(result)).toBe(2)

		value = 5

		expect(unbox(result)).toBe(5)
	})
})
