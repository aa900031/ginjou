import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { factory } from '@mswjs/data'
import { vueRouter } from 'storybook-vue3-router'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import FormCreate from './FormCreate.vue'
import FormEdit from './FormEdit.vue'
import { toHandlers } from './utils/msw-data'
import { args as MutationModeArgs, argTypes as MutationModeArgTypes } from './utils/sb-args/mutation-mode'
import { argTypes as RedirectArgTypes } from './utils/sb-args/redirect'
import { PostCreate, PostEdit, PostList, PostShow } from './utils/sb-renders/post-simple-view'
import { renderRouteView } from './utils/sb-renders/route-view'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Controllers/Form',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Create: StoryObj<typeof meta> = {
	name: 'Create',
	render: renderRouteView,
	parameters: {
		msw: {
			handlers: toHandlers(db, 'posts', 'https://rest-api.local'),
		},
	},
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					create: '/posts/create',
					list: '/posts',
					show: '/posts/:id',
					edit: '/posts/:id/edit',
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
				path: '/posts/create',
				component: FormCreate,
			},
			{
				path: '/posts',
				component: PostList,
			},
			{
				path: '/posts/:id',
				component: PostShow,
			},
			{
				path: '/posts/:id/edit',
				component: PostEdit,
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
	parameters: {
		msw: {
			handlers: toHandlers(db, 'posts', 'https://rest-api.local'),
		},
	},
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					edit: '/posts/:id/edit',
					show: '/posts/:id',
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
				redirect: '/posts/6c6d3a48-8eef-4c96-a1ba-156bdfd3d389/edit',
			},
			{
				path: '/posts/:id/edit',
				component: FormEdit,
			},
			{
				path: '/posts/:id',
				component: PostShow,
			},
			{
				path: '/posts/create',
				component: PostCreate,
			},
			{
				path: '/posts',
				component: PostList,
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
