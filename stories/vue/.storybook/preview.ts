import type { Preview } from '@storybook/vue3-vite'
import { AbortDefer } from '@ginjou/core'
import Aura from '@primevue/themes/aura'
import { setup } from '@storybook/vue3-vite'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'uno.css'

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
