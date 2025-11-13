import type { Query } from '@tanstack/query-core'
import type { AccessCanParams, Authz } from './authz'
import { describe, expect, it, vi } from 'vitest'
import { createQueryEnabledFn, createQueryFn, createQueryKey } from './can'

describe('createQueryKey', () => {
	it('should return a query key with all params', () => {
		const params: AccessCanParams = {
			resource: 'article',
			action: 'create',
			params: {
				foo: 'bar',
			},
			meta: {
				baz: 'qux',
			},
		}
		const key = createQueryKey({ params })
		expect(key).toEqual(['authz', 'access', 'article', 'create', { foo: 'bar' }, { baz: 'qux' }])
	})

	it('should filter out null or undefined params', () => {
		const params: AccessCanParams = {
			resource: 'article',
			action: 'create',
		}
		const key = createQueryKey({ params })
		expect(key).toEqual(['authz', 'access', 'article', 'create'])
	})
})

describe('createQueryFn', () => {
	it('should call authz.access with correct params', async () => {
		const authz: Authz = {
			access: vi.fn().mockResolvedValue({ can: true }),
		}
		const params: AccessCanParams = {
			resource: 'article',
			action: 'create',
		}
		const queryFn = createQueryFn({ authz, getParams: () => params })
		await queryFn({} as any)
		expect(authz.access).toHaveBeenCalledWith(params)
	})

	it('should return default access can result when authz.access is not available', async () => {
		const authz: Authz = {}
		const params: AccessCanParams = {
			resource: 'article',
			action: 'create',
		}
		const queryFn = createQueryFn({ authz, getParams: () => params })
		const result = await queryFn({} as any)
		expect(result).toEqual({ can: true })
	})

	it('should return default access can result when authz is not available', async () => {
		const params: AccessCanParams = {
			resource: 'article',
			action: 'create',
		}
		const queryFn = createQueryFn({ authz: undefined, getParams: () => params })
		const result = await queryFn({} as any)
		expect(result).toEqual({ can: true })
	})
})

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>

	it('should return true if getEnabled returns true and authz.access is a function', () => {
		const getAuthz = () => ({ access: vi.fn() }) as any
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getAuthz = () => ({ access: vi.fn() }) as any
		const getEnabled = () => false
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should return false if authz.access is not a function', () => {
		const getAuthz = () => ({} as any)
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should return true if getEnabled returns undefined and authz.access is a function', () => {
		const getAuthz = () => ({ access: vi.fn() }) as any
		const getEnabled = () => undefined
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(true)
	})

	it('should return false if getEnabled returns undefined and authz is undefined', () => {
		const getAuthz = () => undefined
		const getEnabled = () => undefined
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})
})
