import { eventRef } from '@bouzu/vue-helper'
import { useI18nContext } from './context'

export function useLocale() {
	const i18n = useI18nContext()

	if (
		!i18n
		|| !i18n.getLocale
		|| !i18n.setLocale
		|| !i18n.onChangeLocale
	) {
		throw new Error('No i18n locale properties')
	}

	const [value] = eventRef({
		register: handler => i18n.onChangeLocale!(handler),
		get: () => i18n.getLocale!(),
		set: val => i18n.setLocale!(val),
	})

	return value
}
