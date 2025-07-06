import type { RouterGoParams } from '../router'
import type { AuthCommonObjectResult, AuthCommonResult } from './auth'

export function resolveRedirectTo(
	data: AuthCommonResult,
	propsFromFn: any & Partial<AuthCommonObjectResult>,
	propsFromProps: Partial<AuthCommonObjectResult> | undefined,
): RouterGoParams | false | undefined {
	return getRedirectTo(data)
		?? getRedirectToByObject(propsFromFn)
		?? getRedirectToByObject(propsFromProps)
}

export function resolveIgnoreInvalidate(
	data: AuthCommonResult,
	propsFromFn: any & Partial<AuthCommonObjectResult>,
	propsFromProps: Partial<AuthCommonObjectResult> | undefined,
): boolean | undefined {
	return getIgnoreInvalidate(data)
		?? getIgnoreInvalidate(propsFromFn)
		?? getIgnoreInvalidate(propsFromProps)
}

export function getRedirectTo(
	data: AuthCommonResult,
): RouterGoParams | false | undefined {
	if (data == null)
		return
	if (data === false)
		return false
	if (typeof data === 'string')
		return { to: data }

	return getRedirectToByObject(data)
}

export function getRedirectToByObject(
	data: AuthCommonObjectResult | Partial<AuthCommonObjectResult> | undefined,
): RouterGoParams | false | undefined {
	if (data != null && typeof data === 'object' && 'redirectTo' in data) {
		if (typeof data.redirectTo === 'string')
			return { to: data.redirectTo }
		return data.redirectTo
	}
}

export function getIgnoreInvalidate(
	data: AuthCommonResult,
): boolean | undefined {
	if (data != null && typeof data === 'object' && 'ignoreInvalidate' in data)
		return data.ignoreInvalidate
}
