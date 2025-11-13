import { describe, expect, it } from 'vitest'
import { createQueryKey } from './permissions'

describe('createQueryKey', () => {
	it('should return the correct query key without params', () => {
		const key = createQueryKey()
		expect(key).toEqual(['authz', 'permissions'])
	})

	it('should return the correct query key with params', () => {
		const params = { id: 1 }
		const key = createQueryKey(params)
		expect(key).toEqual(['authz', 'permissions', params])
	})

	it('should filter out nullish params', () => {
		const key = createQueryKey(undefined)
		expect(key).toEqual(['authz', 'permissions'])
	})
})
