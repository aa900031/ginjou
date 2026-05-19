import { describe, expect, it } from 'vitest'
import { withAccessors } from './proxy'

describe('withAccessors', () => {
	it('should read computed accessor values', () => {
		const result = withAccessors({
			base: 1,
		}, {
			total: () => 3,
		})

		expect(result.base).toBe(1)
		expect(result.total).toBe(3)
	})

	it('should delegate writes through accessor setters', () => {
		let value = 1
		const result = withAccessors({}, {
			current: {
				get: () => value,
				set: (nextValue) => {
					value = nextValue
				},
			},
		})

		result.current = 4

		expect(value).toBe(4)
		expect(result.current).toBe(4)
	})

	it('should report accessor keys through the in operator', () => {
		const result = withAccessors({}, {
			current: () => 1,
		})

		expect('current' in result).toBe(true)
	})

	it('should refuse writes for readonly accessors', () => {
		const result = withAccessors({}, {
			current: () => 1,
		})

		expect(Reflect.set(result, 'current', 4)).toBe(false)
		expect(result.current).toBe(1)
	})
})
