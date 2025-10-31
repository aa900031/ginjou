import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { userEvent, waitFor } from 'storybook/test'
import { h } from 'vue'
import Auth from './Auth.vue'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Authentication/Authenticated',
}

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(Auth),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
	play: async ({ mount }) => {
		const canvas = await mount()

		const login = await canvas.findByTestId('btn-login', undefined, {
			timeout: 3000,
		})

		await userEvent.click(login)

		await waitFor(() => login.textContent === 'Login...')

		const logout = await canvas.findByTestId('btn-logout', undefined, {
			timeout: 3000,
		})

		await userEvent.click(logout)

		await waitFor(() => login.textContent === 'Logout...')
	},
}

export default meta
