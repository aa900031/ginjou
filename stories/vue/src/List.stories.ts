import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { vueRouter } from 'storybook-vue3-router'
import { h } from 'vue'
import { RouterView } from 'vue-router'
import ListFilters from './ListFilters.vue'
import ListFiltersWithCustomSyncRoute from './ListFiltersWithCustomSyncRoute.vue'
import ListPagination from './ListPagination.vue'
import ListSorters from './ListSorters.vue'
import ListSortersWithCustomSyncRoute from './ListSortersWithCustomSyncRoute.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Controllers/List',
} satisfies Meta

export const Pagination = {
	name: 'Pagination',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					list: '/posts',
				},
			],
			router: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: ListPagination,
			},
		]),
	],
} satisfies StoryObj<typeof meta>

export const Filters = {
	name: 'Filters',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					list: '/posts',
				},
			],
			router: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: ListFilters,
			},
		]),
	],
} satisfies StoryObj<typeof meta>

export const FiltersWithCustomSyncRoute = {
	name: 'Filters w/ custom sync route',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					list: '/posts',
				},
			],
			router: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: ListFiltersWithCustomSyncRoute,
			},
		]),
	],
} satisfies StoryObj<typeof meta>

export const Sorters = {
	name: 'Sorters',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					list: '/posts',
				},
			],
			router: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: ListSorters,
			},
		]),
	],
} satisfies StoryObj<typeof meta>

export const SortersWithCustomSyncRoute = {
	name: 'Sorters w/ custom sync route',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					list: '/posts',
				},
			],
			router: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: ListSortersWithCustomSyncRoute,
			},
		]),
	],
} satisfies StoryObj<typeof meta>

export default meta
