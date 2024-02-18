import { h } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { createWrapper } from './utils/wrapper'
import AuthCheckError from './AuthCheckError.vue'

const meta: Meta = {
	title: 'Authentication/Check Error',
}

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(AuthCheckError),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
}

export default meta
