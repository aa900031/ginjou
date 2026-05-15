import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { mutationMode, redirect } from '@ginjou/storybook-shared/args'

import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { vueRouter } from 'storybook-vue3-router'
import FormCreate from './FormCreate.vue'
import FormEdit from './FormEdit.vue'
import { PostCreate, PostEdit, PostList, PostShow } from './utils/sb-renders/post-simple-view'
import { renderRouteView } from './utils/sb-renders/route-view'
import { createWrapper } from './utils/wrapper'

const { argTypes: MutationModeArgTypes, args: MutationModeArgs } = mutationMode
const { argTypes: RedirectArgTypes } = redirect

const meta = {
	title: 'Controllers/Form',
} satisfies Meta

export const Create = {
	name: 'Create',
	render: renderRouteView,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
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
} satisfies StoryObj<typeof meta>

export const Edit = {
	name: 'Edit',
	render: renderRouteView,
	parameters: {
		msw: {
			handlers: createPostHandlers(),
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
} satisfies StoryObj<typeof meta>

export default meta
