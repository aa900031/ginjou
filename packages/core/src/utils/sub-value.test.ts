import { describe, expect, it, vi } from 'vitest'
import { getSubValue } from './sub-value'

describe('getSubValue', () => {
	it('should return undefined if prop is null', () => {
		const result = getSubValue({ prop: null, path: 'a.b' })
		expect(result).toBeUndefined()
	})

	it('should return undefined if prop is undefined', () => {
		const result = getSubValue({ prop: undefined, path: 'a.b' })
		expect(result).toBeUndefined()
	})

	it('should return prop if isValue returns true', () => {
		const prop = { value: 'test' }
		const isValue = vi.fn().mockReturnValue(true)
		const result = getSubValue({ prop, path: 'value', isValue })
		expect(isValue).toHaveBeenCalledWith(prop)
		expect(result).toBe(prop)
	})

	it('should return the value from path if isValue returns false', () => {
		const prop = { a: { b: 'test' } }
		const isValue = vi.fn().mockReturnValue(false)
		const result = getSubValue({ prop, path: 'a.b', isValue })
		expect(isValue).toHaveBeenCalledWith(prop)
		expect(result).toBe('test')
	})

	it('should return the value from path if isValue is not provided', () => {
		const prop = { a: { b: 'test' } }
		const result = getSubValue({ prop, path: 'a.b' })
		expect(result).toBe('test')
	})

	it('should return prev if current value is equal to prev', () => {
		const prop = { a: { b: 'test' } }
		const prev = 'test'
		const result = getSubValue({ prop, path: 'a.b', prev })
		expect(result).toBe(prev)
	})

	it('should return current if current value is not equal to prev', () => {
		const prop = { a: { b: 'new value' } }
		const prev = 'old value'
		const result = getSubValue({ prop, path: 'a.b', prev })
		expect(result).toBe('new value')
	})

	it('should handle complex objects and paths', () => {
		const prop = {
			user: {
				profile: {
					name: 'John Doe',
					age: 30,
				},
			},
		}
		const result = getSubValue({ prop, path: 'user.profile.name' })
		expect(result).toBe('John Doe')
	})

	it('should return undefined if path does not exist', () => {
		const prop = { a: { b: 'test' } }
		const result = getSubValue({ prop, path: 'a.c' })
		expect(result).toBeUndefined()
	})

	it('should return prop if path is empty string', () => {
		const prop = { a: { b: 'test' } }
		const result = getSubValue({ prop, path: '' })
		expect(result).toBe(prop)
	})

	it('should return prop if path is empty string and isValue is true', () => {
		const prop = { a: { b: 'test' } }
		const isValue = vi.fn().mockReturnValue(true)
		const result = getSubValue({ prop, path: '', isValue })
		expect(result).toBe(prop)
	})
})
