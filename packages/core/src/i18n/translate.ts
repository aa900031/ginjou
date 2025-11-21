import type { Params } from '../query'
import type { I18n } from './i18n'

export interface TranslateFn<
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

export interface CreateTranslateFnProps {
	i18n?: I18n
}

export function createTranslateFn<
	TParams extends Params,
>(
	{
		i18n,
	}: CreateTranslateFnProps,
): TranslateFn<TParams> {
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
) {
	return defaultValue ?? key
}
