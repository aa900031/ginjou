/* eslint-disable perfectionist/sort-imports */
import 'uno.css'
import type { Preview } from '@storybook/vue3-vite'
import { AbortDefer } from '@ginjou/core'
import { setup as setupVue } from '@storybook/vue3-vite'
import { mswLoader as MswLoader, initialize as setupMsw } from 'msw-storybook-addon'
import { parameters, withDarkClass } from '@ginjou/storybook-config/preview'

setupMsw({
	onUnhandledRequest: 'bypass',
	serviceWorker: {
		url: './mockServiceWorker.js',
	},
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
	decorators: [
		withDarkClass,
	],
	parameters: {
		...parameters,
	},
} satisfies Preview
