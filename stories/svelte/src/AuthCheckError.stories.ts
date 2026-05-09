import type { Meta, StoryObj } from '@storybook/svelte-vite'
import AuthCheckError from './AuthCheckError.svelte'

const meta = {
	title: 'Authentication/Check Error',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: AuthCheckError as any,
	}),
} satisfies StoryObj<typeof meta>

export default meta
