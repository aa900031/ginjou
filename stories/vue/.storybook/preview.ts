import 'uno.css'
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
