import type { Meta, StoryObj } from '@storybook/svelte-vite'
import AuthPermissions from './AuthPermissions.svelte'

const meta = {
	title: 'Authentication/Permissions',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: AuthPermissions as any,
	}),
} satisfies StoryObj<typeof meta>

export default meta
