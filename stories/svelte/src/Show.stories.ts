import type { Meta, StoryObj } from '@storybook/svelte-vite'
import ShowBasic from './ShowBasic.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Controllers/Show',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: ShowBasic as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
