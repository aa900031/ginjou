import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'
import AuthGetIdentity from './AuthGetIdentity.vue'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Authentication/Get Identity',
}

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(AuthGetIdentity),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
}

export default meta
