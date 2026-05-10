import type { Params } from '../query'
import type { I18n } from './i18n'

export interface Fn<
	TParams,
> {
	(
		key: string,
		params?: TParams
	): string
	(
		key: string,
		params: TParams | undefined,
		defaultValue: string
	): string
}

export interface CreateFnProps {
	i18n?: I18n
}

export function createFn<
	TParams extends Params,
>(
	{
		i18n,
	}: CreateFnProps,
): Fn<TParams> {
	if (!i18n)
		return safeTranslateFn

	return function translateFn(
		key: string,
		params?: TParams | undefined,
		defaultValue?: string | undefined,
	): string {
		return i18n.translate(key, params) ?? safeTranslateFn(key, params, defaultValue)
	}
}

function safeTranslateFn(
	key: string,
	params?: any,
	defaultValue?: string,
): string {
	return defaultValue ?? key
}
