/* eslint-disable perfectionist/sort-imports */
import 'uno.css'
import type { Preview } from '@storybook/svelte-vite'
import { mswLoader as MswLoader, initialize as setupMsw } from 'msw-storybook-addon'
import { parameters, withDarkClass } from '@ginjou/storybook-config/preview'

setupMsw({
	onUnhandledRequest: 'bypass',
	serviceWorker: {
		url: './mockServiceWorker.js',
	},
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
