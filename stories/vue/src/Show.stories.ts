import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { Collection } from '@msw/data'
import { vueRouter } from 'storybook-vue3-router'
import { h } from 'vue'
import { RouterView } from 'vue-router'
import MOCK_POSTS from '../data/mock-posts.json'
import { PostSchema } from './api/posts'
import ShowBasic from './ShowBasic.vue'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Controllers/Show',
}

const posts = new Collection({
	schema: PostSchema,
})
MOCK_POSTS.forEach(post => posts.create(post))

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
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
					show: '/posts/:id',
				},
			],
			router: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts/6c6d3a48-8eef-4c96-a1ba-156bdfd3d389',
			},
			{
				path: '/posts/:id',
				component: ShowBasic,
			},
		]),
	],
}

export default meta
