import type { Meta, StoryObj } from '@storybook/svelte-vite'
import ListPagination from './ListPagination.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Controllers/List',
	component: ListPagination,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof ListPagination>

export default meta

type Story = StoryObj<typeof meta>

export const Pagination = {} satisfies Story
