import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import InfiniteListPagination from './InfiniteListPagination.svelte'

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
