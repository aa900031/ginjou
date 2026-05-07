import type { Meta, StoryObj } from '@storybook/svelte-vite'
import CreateOne from './CreateOne.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Query/Create',
	component: CreateOne,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof CreateOne>

export default meta

type Story = StoryObj<typeof meta>

export const Basic = {} satisfies Story
