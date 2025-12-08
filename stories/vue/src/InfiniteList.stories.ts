import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { Collection } from '@msw/data'
import { vueRouter } from 'storybook-vue3-router'
import { h } from 'vue'
import { RouterView } from 'vue-router'
import MOCK_POSTS from '../data/mock-posts.json'
import { PostSchema } from './api/posts'
import InfiniteListPagination from './InfiniteListPagination.vue'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Controllers/Infinite List',
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
				component: InfiniteListPagination,
			},
		]),
	],
}

export default meta
