import type { Meta, StoryObj } from '@storybook/svelte-vite'
import I18nLocale from './I18nLocale.svelte'

const meta = {
	title: 'I18n/Locale',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: I18nLocale as any,
	}),
} satisfies StoryObj<typeof meta>

export default meta
