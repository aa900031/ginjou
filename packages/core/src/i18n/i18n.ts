export type I18nTranslateFn<
	TParams extends Record<any, any>,
> = (
	key: string,
	params?: TParams,
) => string | undefined

export type I18nGetLocaleFn = () => string

export type I18nSetLocaleFn<
	TOptions,
> = (
	locale: string,
	options?: TOptions,
) => void | Promise<void>

export type I18nOnLocaleChangeFn = (
	handler: (locale: string) => void,
) => () => void

export interface I18n {
	translate: I18nTranslateFn<Record<any, any>>

	getLocale?: I18nGetLocaleFn
	setLocale?: I18nSetLocaleFn<unknown>
	onChangeLocale?: I18nOnLocaleChangeFn
}

/* @__NO_SIDE_EFFECTS__ */
export function defineI18n<
	T extends I18n,
>(
	value: T,
): T {
	return value
}
