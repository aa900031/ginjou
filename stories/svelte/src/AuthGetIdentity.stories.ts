import type { Meta, StoryObj } from '@storybook/svelte-vite'
import AuthGetIdentity from './AuthGetIdentity.svelte'

const meta = {
	title: 'Authentication/Get Identity',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: AuthGetIdentity as any,
	}),
} satisfies StoryObj<typeof meta>

export default meta
