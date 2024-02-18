import { h } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { createWrapper } from './utils/wrapper'
import Auth from './Auth.vue'

const meta: Meta = {
	title: 'Authentication/Authenticated',
}

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(Auth),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
}

export default meta
