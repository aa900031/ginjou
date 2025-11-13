import type { Query } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryContext } from '../../test/tanstack-utils'
import { createQueryEnabledFn, createQueryFn, createQueryKey } from './identity'

describe('createQueryKey', () => {
	it('should return the correct query key with params', () => {
		const params = { id: 1 }
		expect(createQueryKey(params)).toEqual(['auth', 'identity', params])
	})

	it('should return the correct query key without params', () => {
		expect(createQueryKey()).toEqual(['auth', 'identity'])
	})
})

describe('createQueryFn', () => {
	it('should throw an error if auth.getIdentity is not a function', async () => {
		const getParams = () => ({})
		const queryFn = createQueryFn({ auth: undefined, getParams })
		await expect(queryFn(createQueryContext())).rejects.toThrow('No')

		const queryFn2 = createQueryFn({ auth: {} as any, getParams })
		await expect(queryFn2(createQueryContext())).rejects.toThrow('No')
	})

	it('should call auth.getIdentity with params and return the result', async () => {
		const mockIdentityResult = { id: 'user123' }
		const mockGetIdentity = vi.fn(() => Promise.resolve(mockIdentityResult))
		const auth = { getIdentity: mockGetIdentity } as any
		const params = { someParam: 'value' }
		const getParams = () => params

		const queryFn = createQueryFn({ auth, getParams })
		const result = await queryFn(createQueryContext())

		expect(mockGetIdentity).toHaveBeenCalledWith(params)
		expect(result).toEqual(mockIdentityResult)
	})
})

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>

	it('should return true if getEnabled returns true and auth.getIdentity is a function', () => {
		const getAuth = () => ({ getIdentity: vi.fn() }) as any
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getAuth = () => ({ getIdentity: vi.fn() }) as any
		const getEnabled = () => false
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should return false if auth.getIdentity is not a function', () => {
		const getAuth = () => ({} as any)
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should return true if getEnabled returns undefined and auth.getIdentity is a function', () => {
		const getAuth = () => ({ getIdentity: vi.fn() }) as any
		const getEnabled = () => undefined
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(true)
	})

	it('should return false if getEnabled returns undefined and auth is undefined', () => {
		const getAuth = () => undefined
		const getEnabled = () => undefined
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should handle function-based getEnabled correctly', () => {
		const getAuth = () => ({ getIdentity: vi.fn() }) as any
		const getEnabled = () => (_query: Query<any, any, any>) => true
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(true)
	})
})
