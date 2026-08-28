import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAuth, getSSOLoginUrl } from './auth'

// Request shapes are pinned by contract.test.ts against a real client. This file keeps only
// the adapter behaviour that never reaches the wire.

const mockClient = {
	url: new URL('http://localhost:8055'),
	login: vi.fn(),
	logout: vi.fn(),
	refresh: vi.fn(),
	stopRefreshing: vi.fn(),
	getToken: vi.fn(),
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
		it('should use an explicit redirect for "sso" type', async () => {
			const assign = vi.fn()
			vi.stubGlobal('window', { location: { href: 'https://app.example.com/dashboard', assign } })

			await authProvider.login({
				type: 'sso',
				params: { provider: 'okta', redirect: 'https://app.example.com/callback' },
			})

			// Never a credentials POST: the browser has to make this trip itself.
			expect(mockClient.login).not.toHaveBeenCalled()
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

	describe('check', () => {
		it('should not refresh when a token already exists', async () => {
			mockClient.getToken.mockResolvedValue('some-token')
			const result = await authProvider.check()
			expect(result).toEqual({ authenticated: true })
			expect(mockClient.refresh).not.toHaveBeenCalled()
		})
	})

	describe('logout', () => {
		it('should stop SDK refresh scheduling before logging out', async () => {
			await authProvider.logout()

			expect(mockClient.stopRefreshing).toHaveBeenCalledBefore(mockClient.logout)
		})

		it('should wait for a refresh started by check before logging out', async () => {
			const order: string[] = []
			let resolveRefresh!: () => void
			mockClient.getToken.mockResolvedValue(null)
			mockClient.refresh.mockImplementation(() =>
				new Promise<void>((resolve) => { resolveRefresh = resolve })
					.then(() => order.push('refresh')),
			)
			mockClient.logout.mockImplementation(async () => order.push('logout'))

			const checking = authProvider.check()
			await vi.waitFor(() => expect(mockClient.refresh).toHaveBeenCalled())
			const loggingOut = authProvider.logout()
			resolveRefresh()
			await Promise.all([checking, loggingOut])

			// The refresh must not land after logout, or it would restore the tokens.
			expect(order).toEqual(['refresh', 'logout'])
			mockClient.refresh.mockRejectedValue(new Error('no session'))
			await expect(authProvider.check()).resolves.toEqual({ authenticated: false })
		})

		it('should not start a refresh after logout begins', async () => {
			let resolveToken!: (token: null) => void
			// check() calls getToken synchronously, so resolveToken is assigned once check() returns.
			mockClient.getToken.mockImplementationOnce(() => new Promise<null>((resolve) => { resolveToken = resolve }))

			const checking = authProvider.check()
			const loggingOut = authProvider.logout()
			resolveToken(null)

			await expect(checking).resolves.toEqual({ authenticated: false })
			await loggingOut
			expect(mockClient.refresh).not.toHaveBeenCalled()
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
})

describe('getSSOLoginUrl', () => {
	it('should build the provider endpoint against the client url', () => {
		expect(getSSOLoginUrl({ url: new URL('http://localhost:8055') } as any, 'google'))
			.toBe('http://localhost:8055/auth/login/google')
	})

	it('should resolve from the origin, dropping any path prefix on the client url', () => {
		expect(getSSOLoginUrl({ url: new URL('https://cms.example.com/directus/') } as any, 'google'))
			.toBe('https://cms.example.com/auth/login/google')
	})
})
