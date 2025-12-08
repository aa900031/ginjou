import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Collection } from '@msw/data'
import { vueRouter } from 'storybook-vue3-router'
import { h } from 'vue'
import { RouterView } from 'vue-router'
import MOCK_POSTS from '../data/mock-posts.json'
import { PostSchema } from './api/posts'
import ListFilters from './ListFilters.vue'
import ListFiltersWithCustomSyncRoute from './ListFiltersWithCustomSyncRoute.vue'
import ListPagination from './ListPagination.vue'
import ListSorters from './ListSorters.vue'
import ListSortersWithCustomSyncRoute from './ListSortersWithCustomSyncRoute.vue'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Controllers/List',
}

const posts = new Collection({
	schema: PostSchema,
})
MOCK_POSTS.forEach(post => posts.create(post))

export const Pagination: StoryObj<typeof meta> = {
	name: 'Pagination',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: toHandlers(posts, 'posts', 'https://rest-api.local'),
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
}

export const Filters: StoryObj<typeof meta> = {
	name: 'Filters',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: toHandlers(posts, 'posts', 'https://rest-api.local'),
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
}

export const FiltersWithCustomSyncRoute: StoryObj<typeof meta> = {
	name: 'Filters w/ custom sync route',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: toHandlers(posts, 'posts', 'https://rest-api.local'),
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
}

export const Sorters: StoryObj<typeof meta> = {
	name: 'Sorters',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: toHandlers(posts, 'posts', 'https://rest-api.local'),
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
}

export const SortersWithCustomSyncRoute: StoryObj<typeof meta> = {
	name: 'Sorters w/ custom sync route',
	render: () => () => h(RouterView),
	parameters: {
		msw: {
			handlers: toHandlers(posts, 'posts', 'https://rest-api.local'),
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
}

export default meta
