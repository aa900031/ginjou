import type { Meta, StoryObj } from '@storybook/svelte-vite'
import GetOne from './GetOne.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Query/GetOne',
	component: GetOne,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof GetOne>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
