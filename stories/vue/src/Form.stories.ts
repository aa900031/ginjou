import { vueRouter } from 'storybook-vue3-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import { h } from 'vue'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import { createMsw } from './utils/msw'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'
import { renderRouteView } from './utils/sb-renders/route-view'
import { argTypes as MutationModeArgTypes, args as MutationModeArgs } from './utils/sb-args/mutation-mode'
import { argTypes as RedirectArgTypes } from './utils/sb-args/redirect'
import FormCreate from './FormCreate.vue'
import FormEdit from './FormEdit.vue'

const meta: Meta = {
	title: 'Controllers/Form',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Create: StoryObj<typeof meta> = {
	name: 'Create',
	render: renderRouteView,
	loaders: [createMsw(toHandlers(db, 'posts', 'https://rest-api.local'))],
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					create: '/posts/create',
					list: '/posts',
				},
			],
			router: true,
			notification: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts/create',
			},
			{
				path: '/posts',
				component: () => h('h1', 'Posts'),
			},
			{
				path: '/posts/create',
				component: FormCreate,
			},
		]),
	],
	argTypes: {
		...RedirectArgTypes,
	},
}

export const Edit: StoryObj<typeof meta> = {
	name: 'Edit',
	render: renderRouteView,
	loaders: [createMsw(toHandlers(db, 'posts', 'https://rest-api.local'))],
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					edit: '/posts/:id/edit',
					show: '/posts/:id',
				},
			],
			router: true,
			notification: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts/6c6d3a48-8eef-4c96-a1ba-156bdfd3d389/edit',
			},
			{
				path: '/posts/:id',
				component: () => h('h1', 'Posts'),
			},
			{
				path: '/posts/:id/edit',
				component: FormEdit,
			},
		]),
	],
	argTypes: {
		...MutationModeArgTypes,
		...RedirectArgTypes,
	},
	args: {
		...MutationModeArgs,
	},
}

export default meta
