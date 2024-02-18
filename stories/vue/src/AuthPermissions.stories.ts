import { h } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { createWrapper } from './utils/wrapper'
import AuthPermissions from './AuthPermissions.vue'

const meta: Meta = {
	title: 'Authentication/Permissions',
}

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(AuthPermissions),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
}

export default meta
