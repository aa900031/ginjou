import { unref, watch } from 'vue-demi'
import type { Composer, UseI18nOptions } from 'vue-i18n'
import { useI18n } from 'vue-i18n'
import type { I18n } from '@ginjou/core'

export function defineI18nBinding<
	TUseI18nOptions extends UseI18nOptions = UseI18nOptions,
>(
	options?: TUseI18nOptions,
): I18n<
	Record<string, unknown> | unknown[]
> {
	const i18n = useI18n<TUseI18nOptions>(options)

	return {
		translate: (key, params) => i18n.t(
			key,
			params ?? ({} as any),
		),

		getLocale: () => {
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
	}
}

export type UseI18nResult<
	TUseI18nOptions extends UseI18nOptions,
> = Composer<
	NonNullable<TUseI18nOptions['messages']>,
	NonNullable<TUseI18nOptions['datetimeFormats']>,
	NonNullable<TUseI18nOptions['numberFormats']>,
	TUseI18nOptions['locale'] extends unknown ? string : TUseI18nOptions['locale']
>
