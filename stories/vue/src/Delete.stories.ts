import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import { vueRouter } from 'storybook-vue3-router'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import Delete from './Delete.vue'
import DeleteMany from './DeleteMany.vue'
import { createMsw } from './utils/msw'
import { toHandlers } from './utils/msw-data'
import { args as MutationModeArgs, argTypes as MutationModeArgTypes } from './utils/sb-args/mutation-mode'
import { renderRouteView } from './utils/sb-renders/route-view'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Query/Delete',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: renderRouteView,
	loaders: [
		createMsw(toHandlers(db, 'posts', 'https://rest-api.local')),
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
			notification: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: Delete,
			},
		]),
	],
	argTypes: {
		...MutationModeArgTypes,
	},
	args: {
		...MutationModeArgs,
	},
}

export const Many: StoryObj<typeof meta> = {
	name: 'Many',
	render: renderRouteView,
	loaders: [
		createMsw(toHandlers(db, 'posts', 'https://rest-api.local')),
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
}

export default meta
