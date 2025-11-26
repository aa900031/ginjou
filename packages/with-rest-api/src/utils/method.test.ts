import { describe, expect, it } from 'vitest'
import { toMethod } from './method'

describe('toMethod', () => {
	it('should return "PUT" for "put", "post", "patch"', () => {
		expect(toMethod('put')).toBe('PUT')
		expect(toMethod('post')).toBe('PUT')
		expect(toMethod('patch')).toBe('PUT')
	})

	it('should return "DELETE" for "delete"', () => {
		expect(toMethod('delete')).toBe('DELETE')
	})

	it('should return "GET" for "get" and any other string', () => {
		expect(toMethod('get')).toBe('GET')
		expect(toMethod('random_method')).toBe('GET')
		expect(toMethod('HEAD')).toBe('GET')
		expect(toMethod('')).toBe('GET')
	})
})
