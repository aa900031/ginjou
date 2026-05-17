/* eslint-disable perfectionist/sort-imports */
import 'uno.css'
import type { Preview } from '@storybook/svelte-vite'
import { mswLoader as MswLoader, setupMsw } from '@ginjou/storybook-shared/msw'
import { withDarkClass } from '@ginjou/storybook-shared/preview'

setupMsw()

export default {
	loaders: [
		MswLoader,
	],
	decorators: [
		withDarkClass,
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
