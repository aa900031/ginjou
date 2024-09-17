import 'uno.css'
import { AbortDefer } from '@ginjou/core'
import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Aura from '@primevue/themes/aura'

setup((app) => {
	app.use(PrimeVue, {
		theme: {
			preset: Aura,
		},
	})
	app.use(ToastService)
})

setup((app) => {
	const _originErrorHandler = app.config.errorHandler

	app.config.errorHandler = (err, instance, info) => {
		// Ignore AbortDefer Exception
		if (err instanceof AbortDefer)
			return

		_originErrorHandler?.(err, instance, info)
	}
})

export default {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
		options: {
			storySort: {
				order: [
					'Controllers',
					'Query',
				],
			},
		},
	},
} satisfies Preview
