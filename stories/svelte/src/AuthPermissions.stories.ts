import type { Meta, StoryObj } from '@storybook/svelte-vite'
import AuthPermissions from './AuthPermissions.svelte'

const meta = {
	title: 'Authentication/Permissions',
	component: AuthPermissions,
} satisfies Meta<typeof AuthPermissions>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
