import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { userEvent, waitFor } from 'storybook/test'
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
	play: async ({ mount }) => {
		const canvas = await mount()
		const trigger = await canvas.findByRole('button', undefined, {
			timeout: 3000,
		})
		await userEvent.click(trigger)
		await waitFor(() => trigger.textContent === 'Trigger ...')

		const login = await canvas.findByRole('button', undefined, {
			timeout: 3000,
		})
		await userEvent.click(login)
	},
}

export default meta
