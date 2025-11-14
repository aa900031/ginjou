import type { Query } from '@tanstack/query-core'
import { describe, expect, it, vi } from 'vitest'
import { createQueryEnabledFn, createQueryKey } from './permissions'

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

describe('createQueryEnabledFn', () => {
	const mockQuery = {} as Query<any, any, any>

	it('should return true if getEnabled returns true and authz.getPermissions is a function', () => {
		const getAuthz = () => ({ getPermissions: vi.fn() }) as any
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(true)
	})

	it('should return false if getEnabled returns false', () => {
		const getAuthz = () => ({ getPermissions: vi.fn() }) as any
		const getEnabled = () => false
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should return false if authz.getPermissions is not a function', () => {
		const getAuthz = () => ({} as any)
		const getEnabled = () => true
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(false)
	})

	it('should return true if getEnabled returns undefined and authz.getPermissions is a function', () => {
		const getAuthz = () => ({ getPermissions: vi.fn() }) as any
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

	it('should handle function-based getEnabled correctly', () => {
		const getAuthz = () => ({ getPermissions: vi.fn() }) as any
		const getEnabled = () => (_query: Query<any, any, any>) => true
		const enabledFn = createQueryEnabledFn({ getAuthz, getEnabled })
		expect(enabledFn(mockQuery)).toBe(true)
	})
})
