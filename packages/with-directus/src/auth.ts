import type { AuthenticationClient, AuthenticationData, DirectusClient, LoginOptions, RestClient } from '@directus/sdk'
import { getAuthEndpoint, isDirectusError, readMe } from '@directus/sdk'
import { defineAuth } from '@ginjou/core'

export interface CreateAuthProps<
	TClient extends DirectusClient<any> & AuthenticationClient<any> & RestClient<any>,
> {
	client: TClient
}

export type LoginParams
	= | LoginWithPasswordParams
		| LoginWithSSOParams

export interface LoginWithPasswordParams {
	type: 'password'
	params: {
		email: string
		password: string
		options?: Omit<LoginOptions, 'provider'>
	}
}

export interface LoginWithSSOParams {
	type: 'sso'
	params: {
		provider: string
		/**
		 * Where Directus sends the browser back to once the provider has authenticated the user.
		 * Must be listed in the server's `AUTH_<PROVIDER>_REDIRECT_ALLOW_LIST`.
		 *
		 * @default the current page
		 */
		redirect?: string
	}
}

/**
 * Builds the URL that starts a redirect-based SSO handshake.
 *
 * The SDK cannot perform this login: `client.login(payload, { provider })` POSTs credentials to
 * the same endpoint, which only works for the `local` and `ldap` drivers. OAuth2, OpenID and SAML
 * need the browser itself to visit the endpoint so the provider can redirect it back.
 *
 * @see https://directus.com/docs/guides/auth/sso/seamless
 */
export function getSSOLoginUrl(
	client: DirectusClient<any>,
	provider: string,
	redirect?: string,
): string {
	const url = new URL(getAuthEndpoint(provider), client.url)
	if (redirect != null)
		url.searchParams.set('redirect', redirect)

	return url.toString()
}

// eslint-disable-next-line ts/explicit-function-return-type
export function createAuth<
	TClient extends DirectusClient<any> & AuthenticationClient<any> & RestClient<any>,
>(
	{
		client,
	}: CreateAuthProps<TClient>,
) {
	let refreshing: Promise<AuthenticationData | undefined> | undefined

	return defineAuth({
		login: async (params?: LoginParams) => {
			if (!params)
				throw new Error('[@ginjou/with-directus] Login params are required.')

			const { type } = params
			switch (type) {
				case 'password':
					await client.login(
						{
							email: params.params.email,
							password: params.params.password,
						},
						params.params.options,
					)
					break
				case 'sso': {
					if (typeof window === 'undefined')
						throw new Error('[@ginjou/with-directus] SSO login requires a browser, it navigates away from the app.')

					const { provider, redirect = window.location.href } = params.params
					// A full page navigation, so nothing after this runs.
					window.location.assign(getSSOLoginUrl(client, provider, redirect))
					break
				}
				default:
					throw new Error(`[@ginjou/with-directus] Unsupported login type: ${String(type)}`)
			}
		},
		logout: async () => {
			if (refreshing)
				await refreshing
			await client.logout()
		},
		check: async () => {
			let token = await client.getToken()
			if (!token) {
				await refresh()
				token = await client.getToken()
			}

			return {
				authenticated: !!token,
			}
		},
		checkError: async (error) => {
			if (!isAuthError(error))
				return {}

			return {
				logout: true,
				error,
			}
		},
		getIdentity: async (): Promise<Record<any, any>> => {
			const data = await client.request(readMe())
			return data
		},
	})

	function refresh(): Promise<AuthenticationData | undefined> {
		return refreshing ??= client.refresh()
			.then((res) => {
				refreshing = undefined
				return res
			})
			.catch(() => {
				refreshing = undefined
				return undefined
			})
	}
}

const AuthErrors = [
	'TOKEN_EXPIRED',
	'INVALID_CREDENTIALS',
	'INVALID_IP',
	'INVALID_OTP',
]
function isAuthError(error: unknown): boolean {
	if (!isDirectusError(error))
		return false

	return error.errors.some(err => AuthErrors.includes(err.extensions.code))
}
