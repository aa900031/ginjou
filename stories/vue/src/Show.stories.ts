import { h } from 'vue'
import { RouterView } from 'vue-router'
import { vueRouter } from 'storybook-vue3-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import { createMsw } from './utils/msw'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'
import ShowBasic from './ShowBasic.vue'

const meta: Meta = {
	title: 'Controllers/Show',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(RouterView),
	loaders: [createMsw(toHandlers(db, 'posts', 'https://rest-api.local'))],
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
