import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h } from 'vue'
import AuthGetIdentity from './AuthGetIdentity.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Authentication/Get Identity',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => () => h(AuthGetIdentity),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
	play: async ({ mount }) => {
		const canvas = await mount()

		await canvas.findByText('Hi!', { exact: false, trim: true })
	},
} satisfies StoryObj<typeof meta>

export default meta
