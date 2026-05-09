import type { Meta, StoryObj } from '@storybook/svelte-vite'
import UpdateMany from './UpdateMany.svelte'
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

export const Many = {
	render: () => ({
		Component: UpdateMany,
	}),
} satisfies Story
