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

export type GetIdentityFn<
	TData extends BaseRecord,
	TParams extends Params,
> = (
	params?: TParams,
) => Promise<TData>

export interface Auth {
	login: LoginFn<any>
	logout: LogoutFn<any>
	check: CheckAuthFn<any>
	checkError: CheckAuthErrorFn<unknown>
	getIdentity?: GetIdentityFn<BaseRecord, any>
}

/* @__NO_SIDE_EFFECTS__ */
export function defineAuth<T extends Auth>(
	value: T,
): T {
	return value
}
