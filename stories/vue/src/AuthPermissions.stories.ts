import type { Meta, StoryObj } from '@storybook/vue3'
import { h } from 'vue'
import AuthPermissions from './AuthPermissions.vue'
import { createWrapper } from './utils/wrapper'

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
