export type AuthLoginResult = void | false | string | object

export type AuthLogoutResult = void | false | string

export interface AuthCheckResult {
	authenticated: boolean
	redirectTo?: string
	logout?: boolean
	error?: Error | unknown
}

export interface AuthCheckErrorResult {
	redirectTo?: string
	logout?: boolean
	error?: Error | unknown
}

export interface Auth {
	login: (params: any) => Promise<AuthLoginResult>
	logout: (params: any) => Promise<AuthLogoutResult>
	check: (params?: any) => Promise<AuthCheckResult>
	checkError: (error: unknown) => Promise<AuthCheckErrorResult>
	getPermissions?: (params?: any) => Promise<unknown>
	getIdentity?: (params?: any) => Promise<unknown>
}
