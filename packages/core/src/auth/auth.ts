import type { RouterGoParams } from '../router'

export interface AuthCommonObjectResult {
	redirectTo?:
		| false
		| string
		| RouterGoParams
	ignoreInvalidate?: boolean
}

export type AuthCommonResult =
	| void
	| false // prevent redirect
	| string // redirect to path
	| AuthCommonObjectResult

export type AuthLoginResult = AuthCommonResult

export type AuthLogoutResult = AuthCommonResult

export interface AuthCheckResult {
	authenticated: boolean
}

export interface AuthCheckErrorResult {
	redirectTo?:
		| false
		| string
		| RouterGoParams
	logout?: boolean
	error?: Error | unknown
}

export interface Auth {
	login: (params: any) => Promise<AuthLoginResult>
	logout: (params: any) => Promise<AuthLogoutResult>
	check: (params?: any) => Promise<AuthCheckResult>
	checkError: (error: unknown) => Promise<AuthCheckErrorResult>// TODO: Can return void or undefind
	getIdentity?: (params?: any) => Promise<unknown>
}
