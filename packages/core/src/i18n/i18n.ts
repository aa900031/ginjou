export type I18nTranslateFn<
	TParams = unknown,
> = (
	key: string,
	params?: TParams,
) => string | undefined

export type I18nGetLocaleFn = () => string

export type I18nSetLocaleFn<
	TOptions = unknown,
> = (
	locale: string,
	options?: TOptions,
) => void | Promise<void>

export type I18nOnLocaleChangeFn = (
	handler: (locale: string) => void,
) => () => void

export interface I18n {
	translate: I18nTranslateFn<unknown>

	getLocale?: I18nGetLocaleFn
	setLocale?: I18nSetLocaleFn<unknown>
	onChangeLocale?: I18nOnLocaleChangeFn
}
