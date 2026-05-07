import type { Meta, StoryObj } from '@storybook/svelte-vite'
import AuthGetIdentity from './AuthGetIdentity.svelte'

const meta = {
	title: 'Authentication/Get Identity',
	component: AuthGetIdentity,
} satisfies Meta<typeof AuthGetIdentity>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
