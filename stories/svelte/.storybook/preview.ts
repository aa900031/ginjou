/* eslint-disable perfectionist/sort-imports */
import 'uno.css'
import type { Preview } from '@storybook/svelte-vite'
import { mswLoader as MswLoader, initialize as setupMsw } from 'msw-storybook-addon'
import { withBackgroundClass } from './decorators/background-class'

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
		withBackgroundClass,
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
