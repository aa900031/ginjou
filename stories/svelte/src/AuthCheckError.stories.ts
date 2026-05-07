import type { Meta, StoryObj } from '@storybook/svelte-vite'
import AuthCheckError from './AuthCheckError.svelte'

const meta = {
	title: 'Authentication/Check Error',
	component: AuthCheckError,
} satisfies Meta<typeof AuthCheckError>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
