import type { Meta, StoryObj } from '@storybook/svelte-vite'
import InfiniteListPagination from './InfiniteListPagination.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Controllers/Infinite List',
} satisfies Meta

export const Pagination = {
	name: 'Pagination',
	render: () => ({
		Component: InfiniteListPagination as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
