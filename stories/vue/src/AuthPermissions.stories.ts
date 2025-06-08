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
			authz: true,
		}),
	],
	play: async ({ mount }) => {
		const canvas = await mount()
		await canvas.findByText('Permissions: [ "admin" ]', undefined, {
			timeout: 3000,
		})
	},
}

export default meta
