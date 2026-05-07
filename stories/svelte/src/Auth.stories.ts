import type { Meta, StoryObj } from '@storybook/svelte-vite'
import Auth from './Auth.svelte'

const meta = {
	title: 'Authentication/Authenticated',
	component: Auth,
} satisfies Meta<typeof Auth>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
