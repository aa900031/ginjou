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
	play: async ({ mount }) => {
		const canvas = await mount()

		await canvas.findByText('Hi!', { exact: false, trim: true })
	},
}

export default meta
