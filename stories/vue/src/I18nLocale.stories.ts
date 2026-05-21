import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import I18nLocale from './I18nLocale.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'I18n/Locale',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => () => h(I18nLocale),
	decorators: [
		createWrapper({
			i18n: true,
		}),
	],
} satisfies StoryObj<typeof meta>

export default meta
