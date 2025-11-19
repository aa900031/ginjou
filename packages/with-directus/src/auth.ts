import type { AuthenticationClient, DirectusClient, LoginOptions, RestClient } from '@directus/sdk'
import { readMe } from '@directus/sdk'
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
		options?: Omit<LoginOptions, 'provider'>
	}
}

export function createAuth<
	TClient extends DirectusClient<any> & AuthenticationClient<any> & RestClient<any>,
>(
	{
		client,
	}: CreateAuthProps<TClient>,
) {
	return defineAuth({
		login: async (params?: LoginParams) => {
			switch (params?.type) {
				case 'password':
					await client.login(params.params.email, params.params.password, params.params.options)
					break
				case 'sso':
					await client.login('placeholder', 'placeholder', {
						...params.params.options,
						provider: params.params.provider,
					})
					break
			}
			return {}
		},
		logout: async () => {
			await client.logout()
			return {}
		},
		check: async () => {
			const token = await client.getToken()
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
		getIdentity: async (): Promise<any> => {
			const data = await client.request(readMe())
			return data
		},
	})
}

function isClientError(error: unknown): error is {
	errors: {
		message: string
		extensions: {
			code: string
		}
	}[]
	response: Response
} {
	return !!error
		&& typeof error === 'object'
		&& 'errors' in error
		&& Array.isArray(error.errors)
		&& 'response' in error
		&& !!error.response
		&& typeof error.response === 'object'
}

const AuthErrors = [
	'TOKEN_EXPIRED',
	'INVALID_CREDENTIALS',
	'INVALID_IP',
	'INVALID_OTP',
]
function isAuthError(error: unknown): boolean {
	if (!isClientError(error))
		return false

	return !!error.errors.find(err => AuthErrors.includes(err.extensions.code))
}
