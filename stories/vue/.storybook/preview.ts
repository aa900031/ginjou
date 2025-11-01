import type { Preview } from '@storybook/vue3-vite'
import { AbortDefer } from '@ginjou/core'
import Aura from '@primevue/themes/aura'
import { setup as setupVue } from '@storybook/vue3-vite'
import { mswLoader as MswLoader, initialize as setupMsw } from 'msw-storybook-addon'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import 'uno.css'

setupMsw({
	onUnhandledRequest: 'bypass',
})

setupVue((app) => {
	app.use(PrimeVue, {
		theme: {
			preset: Aura,
		},
	})
	app.use(ToastService)
})

setupVue((app) => {
	const _originErrorHandler = app.config.errorHandler

	app.config.errorHandler = (err, instance, info) => {
		// Ignore AbortDefer Exception
		if (err instanceof AbortDefer)
			return

		_originErrorHandler?.(err, instance, info)
	}
})

export default {
	loaders: [
		MswLoader,
	],
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
