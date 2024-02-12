import { h } from 'vue'
import { RouterView } from 'vue-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { factory } from '@mswjs/data'
import MOCK_POSTS from '../data/mock-posts.json'
import { createWrapper } from './utils/wrapper'
import { createMsw } from './utils/msw'
import { MockModel } from './api/posts'
import { toHandlers } from './utils/msw-data'
import ListPagination from './ListPagination.vue'
import ListFilters from './ListFilters.vue'
import ListSorters from './ListSorters.vue'

const meta: Meta = {
	title: 'List',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Pagination: StoryObj<typeof meta> = {
	name: 'Pagination',
	render: () => () => h(RouterView),
	loaders: [
		createMsw(
			toHandlers(db, 'posts', 'https://rest-api.local'),
		),
	],
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
	loaders: [
		createMsw(
			toHandlers(db, 'posts', 'https://rest-api.local'),
		),
	],
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

export const Sorters: StoryObj<typeof meta> = {
	name: 'Sorters',
	render: () => () => h(RouterView),
	loaders: [
		createMsw(
			toHandlers(db, 'posts', 'https://rest-api.local'),
		),
	],
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

export default meta
