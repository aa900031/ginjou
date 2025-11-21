import type { Composer, UseI18nOptions } from 'vue-i18n'
import { defineI18n } from '@ginjou/core'
import { unref, watch } from 'vue-demi'
import { useI18n } from 'vue-i18n'

export function createI18n<
	TUseI18nOptions extends UseI18nOptions = UseI18nOptions,
>(
	options?: TUseI18nOptions,
) {
	const i18n = useI18n<TUseI18nOptions>(options)

	return defineI18n({
		translate: (key, params) => i18n.t(
			key,
			params ?? ({} as any),
		),
		getLocale: (): string => {
			return unref(i18n.locale)!
		},
		setLocale: (locale) => {
			i18n.locale.value = locale as any
		},
		onChangeLocale: (handler) => {
			return watch(i18n.locale, (val) => {
				handler(val!)
			})
		},
	})
}

export type UseI18nResult<
	TUseI18nOptions extends UseI18nOptions,
> = Composer<
	NonNullable<TUseI18nOptions['messages']>,
	NonNullable<TUseI18nOptions['datetimeFormats']>,
	NonNullable<TUseI18nOptions['numberFormats']>,
	TUseI18nOptions['locale'] extends unknown ? string : TUseI18nOptions['locale']
>
