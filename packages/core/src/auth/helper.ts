import type { RouterGoParams } from '../router'
import type { LoginResult, LogoutResult } from './auth'

export function resolveRedirectTo(
	data: LoginResult | LogoutResult,
	propsFromFn: any & Partial<LoginResult | LogoutResult>,
	propsFromProps: Partial<LoginResult | LogoutResult> | undefined,
): RouterGoParams | false | undefined {
	return getRedirectTo(data)
		?? getRedirectToByObject(propsFromFn)
		?? getRedirectToByObject(propsFromProps)
}

export function resolveIgnoreInvalidate(
	data: LoginResult | LogoutResult,
	propsFromFn: any & Partial<LoginResult | LogoutResult>,
	propsFromProps: Partial<LoginResult | LogoutResult> | undefined,
): boolean | undefined {
	return getIgnoreInvalidate(data)
		?? getIgnoreInvalidate(propsFromFn)
		?? getIgnoreInvalidate(propsFromProps)
}

export function getRedirectTo(
	data: LoginResult | LogoutResult | undefined | void,
): RouterGoParams | false | undefined {
	if (data == null)
		return

	return getRedirectToByObject(data)
}

export function getRedirectToByObject(
	data: LoginResult | LogoutResult | Partial<LoginResult | LogoutResult> | undefined | void,
): RouterGoParams | false | undefined {
	if (data != null && typeof data === 'object' && 'redirectTo' in data) {
		if (typeof data.redirectTo === 'string')
			return { to: data.redirectTo }
		return data.redirectTo
	}
}

export function getIgnoreInvalidate(
	data: LoginResult | LogoutResult | undefined | void,
): boolean | undefined {
	if (data != null && typeof data === 'object' && 'ignoreInvalidate' in data)
		return data.ignoreInvalidate
}
