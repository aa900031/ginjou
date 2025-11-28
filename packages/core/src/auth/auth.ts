import type { BaseRecord, Params } from '../query'
import type { RouterGoParams } from '../router'

export interface LoginResult {
	redirectTo?:
		| false
		| string
		| RouterGoParams
	ignoreInvalidate?: boolean
}

export type LoginFn<
	TParams extends Params,
> = (
	params?: TParams,
) => Promise<LoginResult | void>

export interface LogoutResult {
	redirectTo?:
		| false
		| string
		| RouterGoParams
	ignoreInvalidate?: boolean
}

export type LogoutFn<
	TParams extends Params,
> = (
	params?: TParams,
) => Promise<LogoutResult | void>

export interface CheckAuthResult {
	authenticated: boolean
}

export type CheckAuthFn<
	TParams extends Params,
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

export type GetIdentityResult<
	TData,
> = TData | null

export type GetIdentityFn<
	TData,
	TParams extends Params,
> = (
	params?: TParams,
) => Promise<GetIdentityResult<TData>>

export interface Auth {
	login: LoginFn<any>
	logout: LogoutFn<any>
	check: CheckAuthFn<any>
	checkError: CheckAuthErrorFn<unknown>
	getIdentity?: GetIdentityFn<unknown, any>
}

/* @__NO_SIDE_EFFECTS__ */
export function defineAuth<T extends Auth>(
	value: T,
): T {
	return value
}
