import type { Authz } from './authz'
import { describe, expect, it, vi } from 'vitest'
import { createQueryFn, createQueryKey, getQueryEnabled } from './permissions'

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

describe('getQueryEnabled', () => {
	it('should be enabled if authz.getPermissions is a function and enabled is undefined', () => {
		const authz = { getPermissions: () => {} } as unknown as Authz
		const enabled = getQueryEnabled({ authz, enabled: undefined })
		expect(enabled).toBe(true)
	})

	it('should be disabled if authz.getPermissions is not a function and enabled is undefined', () => {
		const authz = {} as unknown as Authz
		const enabled = getQueryEnabled({ authz, enabled: undefined })
		expect(enabled).toBe(false)
	})

	it('should respect the enabled option if provided', () => {
		const authz = { getPermissions: () => {} } as unknown as Authz
		const enabled = getQueryEnabled({ authz, enabled: false })
		expect(enabled).toBe(false)
	})

	it('should respect the enabled option if provided as a function', () => {
		const authz = { getPermissions: () => {} } as unknown as Authz
		const enabled = getQueryEnabled({ authz, enabled: () => false })
		expect(enabled).toBe(false)
	})

	it('should be disabled if authz is undefined', () => {
		const enabled = getQueryEnabled({ authz: undefined, enabled: undefined })
		expect(enabled).toBe(false)
	})
})

describe('createQueryFn', () => {
	it('should call getPermissions with the correct params', async () => {
		const getPermissions = vi.fn().mockResolvedValue('permissions')
		const authz = { getPermissions } as unknown as Authz
		const params = { resource: 'article' }
		const getParams = () => params

		const queryFn = createQueryFn({ authz, getParams })
		const result = await queryFn({} as any)

		expect(getPermissions).toHaveBeenCalledWith(params)
		expect(result).toBe('permissions')
	})

	it('should throw an error if authz is undefined', async () => {
		const getParams = () => ({})
		const queryFn = createQueryFn({ authz: undefined, getParams })

		await expect(queryFn({} as any)).rejects.toThrow('No')
	})

	it('should throw an error if getPermissions is not a function', async () => {
		const authz = {} as unknown as Authz
		const getParams = () => ({})
		const queryFn = createQueryFn({ authz, getParams })

		await expect(queryFn({} as any)).rejects.toThrow('No')
	})
})
