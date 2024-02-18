import type { Auth } from '@ginjou/core'
import type { SignInWithIdTokenCredentials, SignInWithOAuthCredentials, SignInWithPasswordCredentials, SignInWithPasswordlessCredentials, SignInWithSSO, SignOut, SupabaseClient, VerifyOtpParams } from '@supabase/supabase-js'
import { isAuthError } from '@supabase/supabase-js'

export interface CreateAuthProps {
	client: SupabaseClient
}

export type LoginParams =
| LoginWithPasswordParams
| LoginWithOAuthParams
| LoginWithIdTokenParams
| LoginWithOtpParams
| LoginWithSSOParams
| LoginWithOtpTokenParams

export interface LoginWithPasswordParams {
	type: 'password'
	params: SignInWithPasswordCredentials
}

export interface LoginWithOAuthParams {
	type: 'oauth'
	params: SignInWithOAuthCredentials
}

export interface LoginWithIdTokenParams {
	type: 'idtoken'
	params: SignInWithIdTokenCredentials
}

export interface LoginWithOtpParams {
	type: 'otp'
	params: SignInWithPasswordlessCredentials
}

export interface LoginWithSSOParams {
	type: 'sso'
	params: SignInWithSSO
}

export interface LoginWithOtpTokenParams {
	type: 'otp-token'
	params: VerifyOtpParams
}

export type LogoutParams = SignOut

export function createAuth(
	{
		client,
	}: CreateAuthProps,
): Auth {
	return {
		login: async (params: LoginParams) => {
			const { type, params: params2 } = params
			switch (type) {
				case 'password': {
					const { error } = await client.auth.signInWithPassword(params2)
					if (error)
						throw error
					break
				}
				case 'oauth': {
					const { error } = await client.auth.signInWithOAuth(params2)
					if (error)
						throw error
					break
				}
				case 'idtoken': {
					const { error } = await client.auth.signInWithIdToken(params2)
					if (error)
						throw error
					break
				}
				case 'otp': {
					const { error } = await client.auth.signInWithOtp(params2)
					if (error)
						throw error
					break
				}
				case 'sso': {
					const { error } = await client.auth.signInWithSSO(params2)
					if (error)
						throw error
					break
				}
				case 'otp-token': {
					const { error } = await client.auth.verifyOtp(params2)
					if (error)
						throw error
					break
				}
				default:
					throw new Error('No support')
			}
		},
		logout: async (params?: LogoutParams) => {
			const { error } = await client.auth.signOut(params)
			if (error)
				throw error
		},
		check: async () => {
			const { data: { session }, error } = await client.auth.getSession()

			const isPassed = !error && !!session
			if (!isPassed) {
				return {
					authenticated: false,
					logout: isAuthError(error),
					error,
				}
			}

			return {
				authenticated: true,
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
		getIdentity: async () => {
			const { data: { user }, error } = await client.auth.getUser()
			if (error)
				throw error
			return user
		},
	}
}
