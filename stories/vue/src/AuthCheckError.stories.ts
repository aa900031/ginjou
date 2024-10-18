import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'
import AuthCheckError from './AuthCheckError.vue'
import { createWrapper } from './utils/wrapper'

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
