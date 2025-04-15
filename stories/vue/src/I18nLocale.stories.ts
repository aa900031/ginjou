import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'
import I18nLocale from './I18nLocale.vue'
import { createWrapper } from './utils/wrapper'
import { userEvent } from '@storybook/test'

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
	play: async ({ mount }) => {
		const canvas = await mount()
		const selector = await canvas.findByTestId('locale-selector')
		await canvas.findByText('Locale: en-US')
		await canvas.findByText('\'hi\' >>> Hi')
		await userEvent.selectOptions(selector, 'zh-TW')
		await canvas.findByText('Locale: zh-TW')
		await canvas.findByText('\'hi\' >>> 嗨')
	},
}
