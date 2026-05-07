import type { Meta, StoryObj } from '@storybook/svelte-vite'
import I18nLocale from './I18nLocale.svelte'

const meta = {
	title: 'I18n/Locale',
	component: I18nLocale,
} satisfies Meta<typeof I18nLocale>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
