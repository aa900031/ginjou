import type { Meta, StoryObj } from '@storybook/svelte-vite'
import InfiniteListPagination from './InfiniteListPagination.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Controllers/Infinite List',
	component: InfiniteListPagination,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies Meta<typeof InfiniteListPagination>

export default meta

type Story = StoryObj<typeof meta>

export const Pagination = {} satisfies Story
