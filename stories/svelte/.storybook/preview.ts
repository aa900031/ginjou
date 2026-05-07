import type { Preview } from '@storybook/svelte-vite'
import { mswLoader as MswLoader, initialize as setupMsw } from 'msw-storybook-addon'

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
