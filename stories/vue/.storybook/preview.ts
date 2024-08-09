import type { Preview } from '@storybook/vue3'

// import '@unocss/reset/tailwind-compat.css'
import 'uno.css'

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
