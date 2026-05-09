import type { Meta, StoryObj } from '@storybook/svelte-vite'
import ListFilters from './ListFilters.svelte'
import ListFiltersWithCustomSyncRoute from './ListFiltersWithCustomSyncRoute.svelte'
import ListPagination from './ListPagination.svelte'
import ListSorters from './ListSorters.svelte'
import ListSortersWithCustomSyncRoute from './ListSortersWithCustomSyncRoute.svelte'
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

export const Filters = {
	render: () => ({
		Component: ListFilters,
	}),
} satisfies Story

export const FiltersWithCustomSyncRoute = {
	render: () => ({
		Component: ListFiltersWithCustomSyncRoute,
	}),
} satisfies Story

export const Sorters = {
	render: () => ({
		Component: ListSorters,
	}),
} satisfies Story

export const SortersWithCustomSyncRoute = {
	render: () => ({
		Component: ListSortersWithCustomSyncRoute,
	}),
} satisfies Story
