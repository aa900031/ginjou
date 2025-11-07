import { describe, expect, it } from 'vitest'
import { getter } from './getter'

describe('getter', () => {
	it('should return value if it is not a function', () => {
		expect(getter('foo')).toBe('foo')
		expect(getter(123)).toBe(123)
		const obj = { a: 1 }
		expect(getter(obj)).toBe(obj)
		expect(getter(null)).toBe(null)
		expect(getter(undefined)).toBe(undefined)
	})

	it('should return the result of the function call', () => {
		const fn = () => 'result'
		expect(getter(fn)).toBe('result')
	})

	it('should return the result of the function call with arguments', () => {
		const fn = (a: number, b: string) => `${a}-${b}`
		expect(getter(fn, 1, 'test')).toBe('1-test')
	})
})
