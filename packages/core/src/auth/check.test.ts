import type { Query } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryContext } from '../../test/tanstack-utils'
import { createQueryEnabledFn, createQueryFn, createQueryKey } from './check'

describe('createQueryKey', () => {
	it('should return the correct query key with params', () => {
		const params = { id: 1 }
		expect(createQueryKey(params)).toEqual(['auth', 'check', params])
	})

	it('should return the correct query key without params', () => {
		expect(createQueryKey()).toEqual(['auth', 'check'])
	})
})

describe('createQueryFn', () => {
	it('should throw an error if auth.check is not a function', async () => {
		const getParams = () => ({})
		const queryFn = createQueryFn({ auth: undefined, getParams })
		await expect(queryFn(createQueryContext())).rejects.toThrow('No')

		const queryFn2 = createQueryFn({ auth: {} as any, getParams })
		await expect(queryFn2(createQueryContext())).rejects.toThrow('No')
	})

	it('should call auth.check with params and return the result', async () => {
		const mockCheckResult = { authenticated: true }
		const mockCheck = vi.fn(() => Promise.resolve(mockCheckResult))
		const auth = { check: mockCheck } as any
		const params = { id: 1 }
		const getParams = () => params

		const queryFn = createQueryFn({ auth, getParams })
		const result = await queryFn(createQueryContext())

		expect(mockCheck).toHaveBeenCalledWith(params)
		expect(result).toEqual(mockCheckResult)
	})
})

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>

	it('should return true if getEnabled returns true and auth.check is a function', () => {
		const getAuth = () => ({ check: vi.fn() }) as any
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getAuth = () => ({ check: vi.fn() }) as any
		const getEnabled = () => false
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should return false if auth.check is not a function', () => {
		const getAuth = () => ({} as any)
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getAuth, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should return true if getEnabled returns undefined and auth.check is a function', () => {
		const getAuth = () => ({ check: vi.fn() }) as any
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
})
