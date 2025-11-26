import type { Mock } from 'vitest'
import type { LoginParams } from './auth'
import { readMe } from '@directus/sdk'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuth } from './auth'

vi.mock('@directus/sdk', () => ({
	readMe: vi.fn(),
}))

const mockClient = {
	login: vi.fn(),
	logout: vi.fn(),
	getToken: vi.fn(),
	request: vi.fn(),
}

describe('createAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	const authProvider = createAuth({ client: mockClient as any })

	describe('login', () => {
		it('should call client.login with email and password for "password" type', async () => {
			const params: LoginParams = {
				type: 'password',
				params: {
					email: 'test@example.com',
					password: 'password123',
				},
			}
			await authProvider.login(params)
			expect(mockClient.login).toHaveBeenCalledWith(
				'test@example.com',
				'password123',
				undefined,
			)
		})

		it('should call client.login with options for "password" type', async () => {
			const params: LoginParams = {
				type: 'password',
				params: {
					email: 'test@example.com',
					password: 'password123',
					options: { mode: 'json' },
				},
			}
			await authProvider.login(params)
			expect(mockClient.login).toHaveBeenCalledWith(
				'test@example.com',
				'password123',
				{ mode: 'json' },
			)
		})

		it('should call client.login with provider for "sso" type', async () => {
			const params: LoginParams = {
				type: 'sso',
				params: {
					provider: 'google',
				},
			}
			await authProvider.login(params)
			expect(mockClient.login).toHaveBeenCalledWith(
				'placeholder',
				'placeholder',
				{ provider: 'google' },
			)
		})

		it('should call client.login with provider and options for "sso" type', async () => {
			const params: LoginParams = {
				type: 'sso',
				params: {
					provider: 'google',
					options: { mode: 'json' },
				},
			}
			await authProvider.login(params)
			expect(mockClient.login).toHaveBeenCalledWith(
				'placeholder',
				'placeholder',
				{ provider: 'google', mode: 'json' },
			)
		})

		it('should not call client.login if params are not provided', async () => {
			await authProvider.login()
			expect(mockClient.login).not.toHaveBeenCalled()
		})
	})

	describe('logout', () => {
		it('should call client.logout', async () => {
			await authProvider.logout()
			expect(mockClient.logout).toHaveBeenCalled()
		})
	})

	describe('check', () => {
		it('should return authenticated: true if token exists', async () => {
			mockClient.getToken.mockResolvedValue('some-token')
			const result = await authProvider.check()
			expect(result).toEqual({ authenticated: true })
			expect(mockClient.getToken).toHaveBeenCalled()
		})

		it('should return authenticated: false if token does not exist', async () => {
			mockClient.getToken.mockResolvedValue(null)
			const result = await authProvider.check()
			expect(result).toEqual({ authenticated: false })
		})
	})

	describe('checkError', () => {
		it('should return logout: true for an auth error', async () => {
			const authError = {
				errors: [{ extensions: { code: 'TOKEN_EXPIRED' } }],
				response: new Response(),
			}
			const result = await authProvider.checkError(authError)
			expect(result).toEqual({ logout: true, error: authError })
		})

		it('should return an empty object for a non-auth error', async () => {
			const nonAuthError = new Error('Something went wrong')
			const result = await authProvider.checkError(nonAuthError)
			expect(result).toEqual({})
		})

		it('should return an empty object for a client error with non-auth code', async () => {
			const clientError = {
				errors: [{ extensions: { code: 'SOME_OTHER_CODE' } }],
				response: new Response(),
			}
			const result = await authProvider.checkError(clientError)
			expect(result).toEqual({})
		})
	})

	describe('getIdentity', () => {
		it('should call client.request with readMe and return user data', async () => {
			const user = { id: 1, first_name: 'John' }
			const readMePayload = { __readMe: true };
			(readMe as Mock).mockReturnValue(readMePayload)
			mockClient.request.mockResolvedValue(user)

			const result = await authProvider.getIdentity()

			expect(readMe).toHaveBeenCalled()
			expect(mockClient.request).toHaveBeenCalledWith(readMePayload)
			expect(result).toEqual(user)
		})
	})
})
