import type { I18n } from './i18n'

export interface TranslateFn<
	TParams,
> {
	(
		key: string,
		params?: TParams
	): string | undefined
	(
		key: string,
		params: TParams | undefined,
		defaultValue: string
	): string
}

export interface CreateTranslateFnProps {
	i18n?: I18n
}

function DEFAULT_safeTranslateFn(
	key: string,
	params?: any,
	defaultValue?: string,
) {
	return defaultValue ?? key
}

export function createTranslateFn<
	TParams = unknown,
>(
	{
		i18n,
	}: CreateTranslateFnProps,
): TranslateFn<TParams> {
	if (!i18n)
		return DEFAULT_safeTranslateFn

	return function translateFn(
		key: string,
		params?: TParams | undefined,
		defaultValue?: string | undefined,
	): string {
		return i18n.translate(key, params) ?? defaultValue as string
	}
}
