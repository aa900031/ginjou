import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { Collection } from '@msw/data'
import { vueRouter } from 'storybook-vue3-router'
import MOCK_POSTS from '../data/mock-posts.json'
import { PostSchema } from './api/posts'
import DeleteMany from './DeleteMany.vue'
import DeleteOne from './DeleteOne.vue'
import { toHandlers } from './utils/msw-data'
import { args as MutationModeArgs, argTypes as MutationModeArgTypes } from './utils/sb-args/mutation-mode'
import { renderRouteView } from './utils/sb-renders/route-view'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Query/Delete',
} satisfies Meta

const posts = new Collection({
	schema: PostSchema,
})
MOCK_POSTS.forEach(post => posts.create(post))

export const Basic = {
	name: 'Basic',
	render: renderRouteView,
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
			notification: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: DeleteOne,
			},
		]),
	],
	argTypes: {
		...MutationModeArgTypes,
	},
	args: {
		...MutationModeArgs,
	},
} satisfies StoryObj<typeof meta>

export const Many = {
	name: 'Many',
	render: renderRouteView,
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
			notification: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: DeleteMany,
			},
		]),
	],
	argTypes: {
		...MutationModeArgTypes,
	},
	args: {
		...MutationModeArgs,
	},
} satisfies StoryObj<typeof meta>

export default meta
