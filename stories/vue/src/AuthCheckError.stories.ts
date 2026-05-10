import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import AuthCheckError from './AuthCheckError.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Authentication/Check Error',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => () => h(AuthCheckError),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
} satisfies StoryObj<typeof meta>

export default meta
