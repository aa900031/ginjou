import { h } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { createWrapper } from './utils/wrapper'
import AuthGetIdentity from './AuthGetIdentity.vue'

const meta: Meta = {
	title: 'Auth/GetIdentity',
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
