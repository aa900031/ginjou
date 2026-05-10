import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import Auth from './Auth.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Authentication/Authenticated',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => () => h(Auth),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
} satisfies StoryObj<typeof meta>

export default meta
