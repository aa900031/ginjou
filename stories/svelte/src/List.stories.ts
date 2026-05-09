import type { Meta, StoryObj } from '@storybook/svelte-vite'
import ListFilters from './ListFilters.svelte'
import ListFiltersWithCustomSyncRoute from './ListFiltersWithCustomSyncRoute.svelte'
import ListPagination from './ListPagination.svelte'
import ListSorters from './ListSorters.svelte'
import ListSortersWithCustomSyncRoute from './ListSortersWithCustomSyncRoute.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Controllers/List',
} satisfies Meta

export const Pagination = {
	name: 'Pagination',
	render: () => ({
		Component: ListPagination as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export const Filters = {
	name: 'Filters',
	render: () => ({
		Component: ListFilters as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export const FiltersWithCustomSyncRoute = {
	name: 'Filters w/ custom sync route',
	render: () => ({
		Component: ListFiltersWithCustomSyncRoute as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export const Sorters = {
	name: 'Sorters',
	render: () => ({
		Component: ListSorters as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export const SortersWithCustomSyncRoute = {
	name: 'Sorters w/ custom sync route',
	render: () => ({
		Component: ListSortersWithCustomSyncRoute as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
