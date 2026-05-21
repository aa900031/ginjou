import type { Box } from '../utils'
import { onDestroy } from 'svelte'
import { box } from '../utils'
import { useI18nContext } from './context'

export type UseLocaleResult = Box<string>

export function useLocale(): UseLocaleResult {
	const i18n = useI18nContext()

	if (
		!i18n
		|| !i18n.getLocale
		|| !i18n.setLocale
		|| !i18n.onChangeLocale
	) {
		throw new Error('[@ginjou/svelte] Cannot read locale because no i18n locale properties were provided.')
	}

	let value = $state(i18n.getLocale())
	const stop = i18n.onChangeLocale((locale: string) => {
		value = locale
	})

	onDestroy(() => {
		stop()
	})

	return box({
		get: () => value,
		set: (nextLocale: string) => {
			value = nextLocale
			i18n.setLocale!(nextLocale)
		},
	})
}
