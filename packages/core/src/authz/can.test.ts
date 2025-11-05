import type { AccessCanParams, Authz } from './authz'
import { describe, expect, it, vi } from 'vitest'
import { createQueryFn, createQueryKey, getQueryEnabled } from './can'

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
		const queryFn = createQueryFn<any>({ authz, getParams: () => params })
		await queryFn()
		expect(authz.access).toHaveBeenCalledWith(params)
	})

	it('should return default access can result when authz.access is not available', async () => {
		const authz: Authz = {}
		const params: AccessCanParams = {
			resource: 'article',
			action: 'create',
		}
		const queryFn = createQueryFn({ authz, getParams: () => params })
		const result = await queryFn()
		expect(result).toEqual({ can: true })
	})

	it('should return default access can result when authz is not available', async () => {
		const params: AccessCanParams = {
			resource: 'article',
			action: 'create',
		}
		const queryFn = createQueryFn({ authz: undefined, getParams: () => params })
		const result = await queryFn()
		expect(result).toEqual({ can: true })
	})
})

describe('getQueryEnabled', () => {
	it('should return true when enabled is undefined and authz.access is a function', () => {
		const authz: Authz = {
			access: vi.fn(),
		}
		const enabled = getQueryEnabled({ authz, enabled: undefined })
		expect(enabled).toBe(true)
	})

	it('should return false when enabled is undefined and authz.access is not a function', () => {
		const authz: Authz = {}
		const enabled = getQueryEnabled({ authz, enabled: undefined })
		expect(enabled).toBe(false)
	})

	it('should return the value of enabled when it is a boolean', () => {
		const authz: Authz = {
			access: vi.fn(),
		}
		const enabled = getQueryEnabled({ authz, enabled: false })
		expect(enabled).toBe(false)
	})

	it('should call the enabled function and return its value', () => {
		const authz: Authz = {
			access: vi.fn(),
		}
		const enabledFn = vi.fn().mockReturnValue(true)
		const enabled = getQueryEnabled({ authz, enabled: enabledFn })
		expect(enabledFn).toHaveBeenCalled()
		expect(enabled).toBe(true)
	})
})
