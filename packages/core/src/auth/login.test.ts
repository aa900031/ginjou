import { describe, expect, it, vi } from 'vitest'
import { NotificationType } from '../notification'
import { RouterGoType } from '../router'
import { createErrorHandler, createMutateAsyncFn, createMutateFn, createMutationFn, createMutationKey, createSuccessHandler } from './login'

describe('createMutationKey', () => {
	it('should return the correct mutation key', () => {
		expect(createMutationKey()).toEqual(['auth', 'login'])
	})
})

describe('createMutationFn', () => {
	it('should throw an error if auth.login is not a function', async () => {
		const mutationFn = createMutationFn({ auth: undefined })
		await expect(mutationFn({}, {} as any)).rejects.toThrow('No')

		const mutationFn2 = createMutationFn({ auth: {} as any })
		await expect(mutationFn2({}, {} as any)).rejects.toThrow('No')
	})

	it('should call auth.login with params and return the result', async () => {
		const mockLoginResult = { redirectTo: '/dashboard' }
		const mockLogin = vi.fn(() => Promise.resolve(mockLoginResult))
		const auth = { login: mockLogin } as any
		const params = { username: 'test', password: 'password' }

		const mutationFn = createMutationFn({ auth })
		const result = await mutationFn(params, {} as any)

		expect(mockLogin).toHaveBeenCalledWith(params)
		expect(result).toEqual(mockLoginResult)
	})
})

describe('createSuccessHandler', () => {
	const mockQueryClient = { invalidateQueries: vi.fn() } as any

	it('should invalidate queries and redirect to default on success', async () => {
		const mockGo = vi.fn()
		const getProps = () => ({})
		const successHandler = createSuccessHandler({ queryClient: mockQueryClient, go: mockGo, getProps, onSuccess: undefined })

		await successHandler({}, {}, undefined, {} as any)

		const calls = mockQueryClient.invalidateQueries.mock.calls
		expect(calls).toHaveLength(4)
		expect(calls[0][0]).toEqual({ queryKey: ['auth', 'check'] })
		expect(calls[1][0]).toEqual({ queryKey: ['auth', 'identity'] })
		expect(calls[2][0]).toEqual({ queryKey: ['authz', 'permissions'] })
		expect(calls[3][0]).toEqual({ queryKey: ['authz', 'access'] })

		expect(mockGo).toHaveBeenCalledWith({ to: '/', type: RouterGoType.Replace })
	})

	it('should respect redirectTo from data', async () => {
		const mockGo = vi.fn()
		const getProps = () => ({})
		const successHandler = createSuccessHandler({ queryClient: mockQueryClient, go: mockGo, getProps, onSuccess: undefined })
		mockQueryClient.invalidateQueries.mockClear()

		await successHandler({ redirectTo: '/custom' }, {}, undefined, {} as any)

		expect(mockGo).toHaveBeenCalledWith({ to: '/custom' })
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
		const error = new Error('Login failed')

		await errorHandler(error, {}, undefined, {} as any)

		expect(mockNotify).toHaveBeenCalledWith({
			key: 'login-error',
			message: 'auth.login-error',
			description: 'Login failed',
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
		const error = { redirectTo: '/login-again' }

		await errorHandler(error as any, {}, undefined, {} as any)

		expect(mockGo).toHaveBeenCalledWith({ to: '/login-again' })
	})
})

describe('createMutateFn', () => {
	it('should call originFn with variables', () => {
		const mockOriginFn = vi.fn()
		const mutateFn = createMutateFn({ originFn: mockOriginFn })
		const variables = { username: 'user' }
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
		const variables = { username: 'user' }
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
