import { h } from 'vue'
import { RouterView } from 'vue-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import MOCK_POSTS from '../data/mock-posts.json'
import { createWrapper } from './utils/wrapper'
import { createMsw } from './utils/msw'
import { MockModel } from './api/posts'
import ListPagination from './ListPagination.vue'
import { toHandlers } from './utils/msw-data'

const meta: Meta = {
	title: 'List',
}

const dbForPagination = factory(MockModel)
MOCK_POSTS.forEach(dbForPagination.posts.create)

export const Pagination: StoryObj<typeof meta> = {
	name: 'Pagination',
	render: () => () => h(RouterView),
	loaders: [
		createMsw(
			toHandlers(dbForPagination, 'posts', 'https://rest-api.local'),
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
			routes: [
				{
					path: '/',
					redirect: '/posts',
				},
				{
					path: '/posts',
					component: ListPagination,
				},
			],
		}),
	],
}

export default meta
