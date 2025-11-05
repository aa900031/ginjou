import { describe, expect, it, vi } from 'vitest'
import { NotificationType } from '../notification'
import { RouterGoType } from '../router'
import { createErrorHandler, createMutateAsyncFn, createMutateFn, createMutationFn, createMutationKey, createSuccessHandler } from './logout'

describe('createMutationKey', () => {
	it('should return the correct mutation key', () => {
		expect(createMutationKey()).toEqual(['auth', 'logout'])
	})
})

describe('createMutationFn', () => {
	it('should throw an error if auth.logout is not a function', async () => {
		const mutationFn = createMutationFn({ auth: undefined })
		await expect(mutationFn({}, {} as any)).rejects.toThrow('No')

		const mutationFn2 = createMutationFn({ auth: {} as any })
		await expect(mutationFn2({}, {} as any)).rejects.toThrow('No')
	})

	it('should call auth.logout with params and return the result', async () => {
		const mockLogoutResult = { redirectTo: '/login' }
		const mockLogout = vi.fn(() => Promise.resolve(mockLogoutResult))
		const auth = { logout: mockLogout } as any
		const params = { reason: 'user-request' }

		const mutationFn = createMutationFn({ auth })
		const result = await mutationFn(params, {} as any)

		expect(mockLogout).toHaveBeenCalledWith(params)
		expect(result).toEqual(mockLogoutResult)
	})
})

describe('createSuccessHandler', () => {
	const mockQueryClient = { invalidateQueries: vi.fn() } as any

	it('should invalidate queries and redirect to default on success', async () => {
		const mockGo = vi.fn()
		const getProps = () => ({})
		const successHandler = createSuccessHandler({ queryClient: mockQueryClient, go: mockGo, getProps, onSuccess: undefined })
		mockQueryClient.invalidateQueries.mockClear()

		await successHandler({}, {}, undefined, {} as any)

		expect(mockQueryClient.invalidateQueries).toHaveBeenCalledTimes(4)
		expect(mockGo).toHaveBeenCalledWith({ to: '/login', type: RouterGoType.Push })
	})

	it('should respect redirectTo from data', async () => {
		const mockGo = vi.fn()
		const getProps = () => ({})
		const successHandler = createSuccessHandler({ queryClient: mockQueryClient, go: mockGo, getProps, onSuccess: undefined })
		mockQueryClient.invalidateQueries.mockClear()

		await successHandler({ redirectTo: '/custom-login' }, {}, undefined, {} as any)

		expect(mockGo).toHaveBeenCalledWith({ to: '/custom-login' })
	})

	it('should not invalidate queries if ignoreInvalidate is true', async () => {
		const mockGo = vi.fn()
		const getProps = () => ({ ignoreInvalidate: true })
		const successHandler = createSuccessHandler({ queryClient: mockQueryClient, go: mockGo, getProps, onSuccess: undefined })
		mockQueryClient.invalidateQueries.mockClear()

		await successHandler({}, {}, undefined, {} as any)

		expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled()
	})

	it('should not redirect if redirectTo is false', async () => {
		const mockGo = vi.fn()
		const getProps = () => ({ redirectTo: false } as const)
		const successHandler = createSuccessHandler({ queryClient: mockQueryClient, go: mockGo, getProps, onSuccess: undefined })
		mockQueryClient.invalidateQueries.mockClear()

		await successHandler({}, {}, undefined, {} as any)

		expect(mockGo).not.toHaveBeenCalled()
	})
})

describe('createErrorHandler', () => {
	it('should notify error and call onError from prop', async () => {
		const mockNotify = vi.fn()
		const mockTranslate = vi.fn(key => key)
		const mockGo = vi.fn()
		const mockOnError = vi.fn()
		const errorHandler = createErrorHandler({ notify: mockNotify, translate: mockTranslate, go: mockGo, onError: mockOnError })
		const error = new Error('Logout failed')

		await errorHandler(error, {}, undefined, {} as any)

		expect(mockNotify).toHaveBeenCalledWith({
			key: 'logout-error',
			message: 'auth.logout-error',
			description: 'Logout failed',
			type: NotificationType.Error,
		})
		expect(mockOnError).toHaveBeenCalledWith(error, {}, undefined, {} as any)
	})

	it('should redirect on error if redirectTo is provided', async () => {
		const mockNotify = vi.fn()
		const mockTranslate = vi.fn(key => key)
		const mockGo = vi.fn()
		const mockOnError = vi.fn()
		const errorHandler = createErrorHandler({ notify: mockNotify, translate: mockTranslate, go: mockGo, onError: mockOnError })
		const error = { redirectTo: '/error-page' }

		await errorHandler(error as any, {}, undefined, {} as any)

		expect(mockGo).toHaveBeenCalledWith({ to: '/error-page' })
	})
})

describe('createMutateFn', () => {
	it('should call originFn with variables', () => {
		const mockOriginFn = vi.fn()
		const mutateFn = createMutateFn({ originFn: mockOriginFn })
		const variables = { reason: 'test' }
		const options = { onSuccess: vi.fn() }

		mutateFn(variables, options)

		expect(mockOriginFn).toHaveBeenCalledWith(variables, options)
	})

	it('should call originFn with empty object if variables are not provided', () => {
		const mockOriginFn = vi.fn()
		const mutateFn = createMutateFn({ originFn: mockOriginFn })

		mutateFn(undefined, undefined)

		expect(mockOriginFn).toHaveBeenCalledWith({}, undefined)
	})
})

describe('createMutateAsyncFn', () => {
	it('should call originFn with variables', async () => {
		const mockOriginFn = vi.fn()
		const mutateAsyncFn = createMutateAsyncFn({ originFn: mockOriginFn })
		const variables = { reason: 'test' }
		const options = { onSuccess: vi.fn() }

		await mutateAsyncFn(variables, options)

		expect(mockOriginFn).toHaveBeenCalledWith(variables, options)
	})

	it('should call originFn with empty object if variables are not provided', async () => {
		const mockOriginFn = vi.fn()
		const mutateAsyncFn = createMutateAsyncFn({ originFn: mockOriginFn })

		await mutateAsyncFn(undefined, undefined)

		expect(mockOriginFn).toHaveBeenCalledWith({}, undefined)
	})
})
