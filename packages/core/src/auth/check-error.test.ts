import { describe, expect, it, vi } from 'vitest'
import { createMutationFn, createMutationKey, createSuccessHandler } from './check-error'

describe('createMutationKey', () => {
	it('should return the correct mutation key', () => {
		expect(createMutationKey()).toEqual(['auth', 'checkError'])
	})
})

describe('createMutationFn', () => {
	it('should return an empty object if auth or checkError is not defined', async () => {
		const mutationFn = createMutationFn({ auth: undefined })
		await expect(mutationFn({}, {} as any)).resolves.toEqual({})

		const mutationFn2 = createMutationFn({ auth: {} as any })
		await expect(mutationFn2({}, {} as any)).resolves.toEqual({})
	})

	it('should call auth.checkError with the given params and return its result', async () => {
		const mockCheckErrorResult = { someData: 'test' }
		const mockCheckError = vi.fn(() => Promise.resolve(mockCheckErrorResult))
		const auth = { checkError: mockCheckError } as any
		const params = { someParam: 'value' }

		const mutationFn = createMutationFn({ auth })
		const result = await mutationFn(params, {} as any)

		expect(mockCheckError).toHaveBeenCalledWith(params)
		expect(result).toEqual(mockCheckErrorResult)
	})
})

describe('createSuccessHandler', () => {
	it('should call logout if shouldLogout is true', async () => {
		const mockLogout = vi.fn(() => Promise.resolve())
		const mockGo = vi.fn()
		const mockOnSuccess = vi.fn()

		const successHandler = createSuccessHandler({
			logout: mockLogout,
			go: mockGo,
			onSuccess: mockOnSuccess,
		})

		const data = { logout: true, redirectTo: '/some-path' }
		await successHandler(data, {} as any, {} as any, {} as any)

		expect(mockLogout).toHaveBeenCalledWith({ redirectTo: { to: '/some-path' } })
		expect(mockGo).not.toHaveBeenCalled()
		expect(mockOnSuccess).not.toHaveBeenCalled()
	})

	it('should call go if redirectTo is defined and not false', async () => {
		const mockLogout = vi.fn(() => Promise.resolve())
		const mockGo = vi.fn()
		const mockOnSuccess = vi.fn()

		const successHandler = createSuccessHandler({
			logout: mockLogout,
			go: mockGo,
			onSuccess: mockOnSuccess,
		})

		const data = { logout: false, redirectTo: '/another-path' }
		await successHandler(data, {} as any, {} as any, {} as any)

		expect(mockLogout).not.toHaveBeenCalled()
		expect(mockGo).toHaveBeenCalledWith({ to: '/another-path' })
		expect(mockOnSuccess).toHaveBeenCalledWith(data, {} as any, {} as any, {} as any)
	})

	it('should not call go if redirectTo is false', async () => {
		const mockLogout = vi.fn(() => Promise.resolve())
		const mockGo = vi.fn()
		const mockOnSuccess = vi.fn()

		const successHandler = createSuccessHandler({
			logout: mockLogout,
			go: mockGo,
			onSuccess: mockOnSuccess,
		})

		const data = { logout: false, redirectTo: false } as const
		await successHandler(data, {} as any, {} as any, {} as any)

		expect(mockLogout).not.toHaveBeenCalled()
		expect(mockGo).not.toHaveBeenCalled()
		expect(mockOnSuccess).toHaveBeenCalledWith(data, {} as any, {} as any, {} as any)
	})

	it('should call onSuccess from prop if defined', async () => {
		const mockLogout = vi.fn(() => Promise.resolve())
		const mockGo = vi.fn()
		const mockOnSuccess = vi.fn()

		const successHandler = createSuccessHandler({
			logout: mockLogout,
			go: mockGo,
			onSuccess: mockOnSuccess,
		})

		const data = { logout: false }
		const propsFromFn = { someProp: 'value' }
		const context = { someContext: 'value' }
		await successHandler(data, propsFromFn as any, {} as any, context as any)

		expect(mockLogout).not.toHaveBeenCalled()
		expect(mockGo).not.toHaveBeenCalled()
		expect(mockOnSuccess).toHaveBeenCalledWith(data, propsFromFn, {} as any, context)
	})

	it('should not call onSuccess from prop if not defined', async () => {
		const mockLogout = vi.fn(() => Promise.resolve())
		const mockGo = vi.fn()

		const successHandler = createSuccessHandler({
			logout: mockLogout,
			go: mockGo,
			onSuccess: undefined,
		})

		const data = { logout: false }
		await successHandler(data, {} as any, {} as any, {} as any)

		expect(mockLogout).not.toHaveBeenCalled()
		expect(mockGo).not.toHaveBeenCalled()
	})
})
