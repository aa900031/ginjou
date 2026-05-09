import type { Meta, StoryObj } from '@storybook/svelte-vite'
import Auth from './Auth.svelte'

const meta = {
	title: 'Authentication/Authenticated',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: Auth as any,
	}),
} satisfies StoryObj<typeof meta>

export default meta
