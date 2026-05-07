import { onDestroy } from 'svelte'
import { useI18nContext } from './context'

export interface UseLocaleResult {
	value: string
}

export function useLocale(): UseLocaleResult {
	const i18n = useI18nContext()

	if (
		!i18n
		|| !i18n.getLocale
		|| !i18n.setLocale
		|| !i18n.onChangeLocale
	) {
		throw new Error('No i18n locale properties')
	}

	let value = $state(i18n.getLocale())
	const stop = i18n.onChangeLocale((locale) => {
		value = locale
	})

	onDestroy(() => {
		stop?.()
	})

	return {
		get value() {
			return value
		},
		set value(nextLocale: string) {
			value = nextLocale
			i18n.setLocale!(nextLocale)
		},
	}
}
