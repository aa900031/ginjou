import type { Preview } from '@storybook/vue3'
import { initialize, mswDecorator } from 'msw-storybook-addon'

// import '@unocss/reset/tailwind-compat.css'
import 'uno.css'

initialize()

export default {
	parameters: {
		actions: {
			argTypesRegex: '^on[A-Z].*',
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
	},
	decorators: [
		mswDecorator,
	],
} satisfies Preview
