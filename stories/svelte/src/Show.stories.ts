import type { Meta, StoryObj } from '@storybook/svelte-vite'
import ShowBasic from './ShowBasic.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Controllers/Show',
	component: ShowBasic,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof ShowBasic>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
