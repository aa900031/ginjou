import type { Meta, StoryObj } from '@storybook/svelte-vite'
import DeleteMany from './DeleteMany.svelte'
import DeleteOne from './DeleteOne.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Query/Delete',
	component: DeleteOne,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof DeleteOne>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story

export const Many = {
	render: () => ({
		Component: DeleteMany,
	}),
} satisfies Story
