import type { RouterGoParams } from '../router'

export interface LoginResult {
	redirectTo?:
		| false
		| string
		| RouterGoParams
	ignoreInvalidate?: boolean
}

export type LoginFn<
	TParams,
> = (
	params?: TParams,
) => Promise<LoginResult>

export interface LogoutResult {
	redirectTo?:
		| false
		| string
		| RouterGoParams
	ignoreInvalidate?: boolean
}

export type LogoutFn<
	TParams,
> = (
	params?: TParams,
) => Promise<LogoutResult>

export interface CheckAuthResult {
	authenticated: boolean
}

export type CheckAuthFn<
	TParams,
> = (
	params?: TParams,
) => Promise<CheckAuthResult>

export interface CheckAuthErrorResult<
	TError,
> {
	redirectTo?:
		| false
		| string
		| RouterGoParams
	logout?: boolean
	error?: TError
}

export type CheckAuthErrorFn<
	TError,
> = (
	error: TError,
) => Promise<CheckAuthErrorResult<TError>>

export type GetIdentityFn<
	TData,
	TParams,
> = (
	params?: TParams,
) => Promise<TData>

export interface Auth {
	login: LoginFn<unknown>
	logout: LogoutFn<unknown>
	check: CheckAuthFn<unknown>
	checkError: CheckAuthErrorFn<unknown>
	getIdentity?: GetIdentityFn<unknown, unknown>
}
