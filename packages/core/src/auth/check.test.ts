import { describe, expect, it, vi } from 'vitest'
import { createQueryContext } from '../../test/tanstack-utils'
import { createErrorHandler, createQueryFn, createQueryKey, getQueryEnabled } from './check'

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

describe('getQueryEnabled', () => {
	it('should return true if enabled is true and auth.check is a function', () => {
		const auth = { check: () => {} } as any
		expect(getQueryEnabled({ auth, enabled: true })).toBe(true)
	})

	it('should return false if enabled is false', () => {
		const auth = { check: () => {} } as any
		expect(getQueryEnabled({ auth, enabled: false })).toBe(false)
	})

	it('should return false if auth.check is not a function', () => {
		const auth = {} as any
		expect(getQueryEnabled({ auth, enabled: true })).toBe(false)
	})

	it('should resolve enabled function', () => {
		const auth = { check: () => {} } as any
		expect(getQueryEnabled({ auth, enabled: () => true })).toBe(true)
		expect(getQueryEnabled({ auth, enabled: () => false })).toBe(false)
	})
})

describe('createErrorHandler', () => {
	it('should call emitParent with the error', () => {
		const mockGo = vi.fn()
		const getRedirectTo = () => undefined
		const mockEmitParent = vi.fn()
		const errorHandler = createErrorHandler({ go: mockGo, getRedirectTo, emitParent: mockEmitParent })
		const error = new Error('Test Error')

		errorHandler(error)

		expect(mockEmitParent).toHaveBeenCalledWith(error)
	})

	it('should call go with redirectTo from error', () => {
		const mockGo = vi.fn()
		const getRedirectTo = () => '/default'
		const mockEmitParent = vi.fn()
		const errorHandler = createErrorHandler({ go: mockGo, getRedirectTo, emitParent: mockEmitParent })
		const error = { redirectTo: '/error-path' }

		errorHandler(error as any)

		expect(mockGo).toHaveBeenCalledWith({ to: '/error-path' })
	})

	it('should call go with redirectTo from getRedirectTo', () => {
		const mockGo = vi.fn()
		const getRedirectTo = () => '/props-path'
		const mockEmitParent = vi.fn()
		const errorHandler = createErrorHandler({ go: mockGo, getRedirectTo, emitParent: mockEmitParent })
		const error = new Error('Test Error')

		errorHandler(error)

		expect(mockGo).toHaveBeenCalledWith({ to: '/props-path' })
	})

	it('should not call go if redirectTo is false', () => {
		const mockGo = vi.fn()
		const getRedirectTo = () => false as const
		const mockEmitParent = vi.fn()
		const errorHandler = createErrorHandler({ go: mockGo, getRedirectTo, emitParent: mockEmitParent })
		const error = new Error('Test Error')

		errorHandler(error)

		expect(mockGo).not.toHaveBeenCalled()
	})

	it('should not call go if redirectTo is not defined', () => {
		const mockGo = vi.fn()
		const getRedirectTo = () => undefined
		const mockEmitParent = vi.fn()
		const errorHandler = createErrorHandler({ go: mockGo, getRedirectTo, emitParent: mockEmitParent })
		const error = new Error('Test Error')

		errorHandler(error)

		expect(mockGo).not.toHaveBeenCalled()
	})
})
