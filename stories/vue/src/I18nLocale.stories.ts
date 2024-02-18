import { h } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import I18nLocale from './I18nLocale.vue'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'I18n/Locale',
}

export default meta

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(I18nLocale),
	decorators: [
		createWrapper({
			i18n: true,
		}),
	],
}
