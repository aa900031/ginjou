import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import AuthPermissions from './AuthPermissions.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Authentication/Permissions',
} satisfies Meta

export const Basic = {
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
} satisfies StoryObj<typeof meta>

export default meta
