import type { LoginParams } from './auth'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuth, getSSOLoginUrl } from './auth'

// Nothing from the SDK is mocked here. `readMe`, `getAuthEndpoint` and `isDirectusError` are
// pure — faking them would only assert that we call our own fakes.

const mockClient = {
	url: new URL('http://localhost:8055'),
	login: vi.fn(),
	logout: vi.fn(),
	refresh: vi.fn(),
	getToken: vi.fn(),
	request: vi.fn(),
}

function stubWindow(href = 'https://app.example.com/dashboard?tab=1') {
	const assign = vi.fn()
	vi.stubGlobal('window', { location: { href, assign } })
	return assign
}

describe('createAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.unstubAllGlobals()
	})

	const authProvider = createAuth({ client: mockClient as any })

	describe('login', () => {
		it('should call client.login with a payload object for "password" type', async () => {
			const params: LoginParams = {
				type: 'password',
				params: {
					email: 'test@example.com',
					password: 'password123',
				},
			}
			await authProvider.login(params)
			expect(mockClient.login).toHaveBeenCalledWith(
				{ email: 'test@example.com', password: 'password123' },
				undefined,
			)
		})

		it('should pass options through for "password" type', async () => {
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
				{ email: 'test@example.com', password: 'password123' },
				{ mode: 'json' },
			)
		})

		it('should navigate to the provider endpoint for "sso" type', async () => {
			const assign = stubWindow()

			await authProvider.login({ type: 'sso', params: { provider: 'google' } })

			// Never a credentials POST: the browser has to make this trip itself.
			expect(mockClient.login).not.toHaveBeenCalled()
			expect(assign).toHaveBeenCalledWith(
				'http://localhost:8055/auth/login/google?redirect=https%3A%2F%2Fapp.example.com%2Fdashboard%3Ftab%3D1',
			)
		})

		it('should use an explicit redirect for "sso" type', async () => {
			const assign = stubWindow()

			await authProvider.login({
				type: 'sso',
				params: { provider: 'okta', redirect: 'https://app.example.com/callback' },
			})

			expect(assign).toHaveBeenCalledWith(
				'http://localhost:8055/auth/login/okta?redirect=https%3A%2F%2Fapp.example.com%2Fcallback',
			)
		})

		it('should reject "sso" type without a browser', async () => {
			await expect(
				authProvider.login({ type: 'sso', params: { provider: 'google' } }),
			).rejects.toThrow('[@ginjou/with-directus] SSO login requires a browser')
		})

		it('should reject if params are not provided', async () => {
			await expect(authProvider.login()).rejects.toThrow(
				'[@ginjou/with-directus] Login params are required.',
			)
			expect(mockClient.login).not.toHaveBeenCalled()
		})

		it('should reject an unsupported login type', async () => {
			await expect(authProvider.login({ type: 'magic-link' } as any)).rejects.toThrow(
				'[@ginjou/with-directus] Unsupported login type: magic-link',
			)
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
			expect(mockClient.refresh).not.toHaveBeenCalled()
		})

		it('should refresh once when the token store is cold', async () => {
			// The state right after an SSO redirect, and after any reload on memoryStorage.
			mockClient.getToken
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce('token-from-cookie')
			mockClient.refresh.mockResolvedValue({})

			const result = await authProvider.check()

			expect(mockClient.refresh).toHaveBeenCalledTimes(1)
			expect(result).toEqual({ authenticated: true })
		})

		it('should return authenticated: false when the refresh fails', async () => {
			mockClient.getToken.mockResolvedValue(null)
			mockClient.refresh.mockRejectedValue(new Error('no session cookie'))

			const result = await authProvider.check()

			expect(mockClient.refresh).toHaveBeenCalledTimes(1)
			expect(result).toEqual({ authenticated: false })
		})
	})

	describe('checkError', () => {
		it('should return logout: true for an auth error', async () => {
			const authError = {
				errors: [{ message: 'Token expired.', extensions: { code: 'TOKEN_EXPIRED' } }],
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
				errors: [{ message: 'Nope.', extensions: { code: 'SOME_OTHER_CODE' } }],
				response: new Response(),
			}
			const result = await authProvider.checkError(clientError)
			expect(result).toEqual({})
		})
	})

	describe('getIdentity', () => {
		it('should request the current user and return the data', async () => {
			const user = { id: 1, first_name: 'John' }
			mockClient.request.mockResolvedValue(user)

			const result = await authProvider.getIdentity()

			const [command] = mockClient.request.mock.calls[0]
			expect(command()).toMatchObject({ path: '/users/me', method: 'GET' })
			expect(result).toEqual(user)
		})
	})
})

describe('getSSOLoginUrl', () => {
	it('should build the provider endpoint against the client url', () => {
		expect(getSSOLoginUrl({ url: new URL('http://localhost:8055') } as any, 'google'))
			.toBe('http://localhost:8055/auth/login/google')
	})

	it('should keep a path prefix on the client url', () => {
		expect(getSSOLoginUrl({ url: new URL('https://cms.example.com/directus/') } as any, 'google'))
			.toBe('https://cms.example.com/auth/login/google')
	})
})
