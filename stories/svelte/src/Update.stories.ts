import type { Meta, StoryObj } from '@storybook/svelte-vite'
import UpdateOne from './UpdateOne.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Query/Update',
	component: UpdateOne,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof UpdateOne>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
