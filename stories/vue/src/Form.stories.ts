import { h } from 'vue'
import { RouterView } from 'vue-router'
import { vueRouter } from 'storybook-vue3-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import { MutationMode } from '@ginjou/core'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import { createMsw } from './utils/msw'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'
import FormCreate from './FormCreate.vue'
import FormEdit from './FormEdit.vue'

const meta: Meta = {
	title: 'Controllers/Form',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Create: StoryObj<typeof meta> = {
	name: 'Create',
	render: () => () => h(RouterView),
	loaders: [createMsw(toHandlers(db, 'posts', 'https://rest-api.local'))],
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					create: '/posts/create',
				},
			],
			router: true,
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
		]),
	],
}

export const Edit: StoryObj<typeof meta> = {
	name: 'Edit',
	render: (args) => {
		return () => h(RouterView, args)
	},
	loaders: [createMsw(toHandlers(db, 'posts', 'https://rest-api.local'))],
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					edit: '/posts/:id/edit',
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
		]),
	],
	argTypes: {
		mutationMode: {
			name: 'Mutation Mode',
			control: {
				type: 'radio',
			},
			options: [
				MutationMode.Optimistic,
				MutationMode.Pessimistic,
				MutationMode.Undoable,
			],
		},
	},
	args: {
		mutationMode: MutationMode.Pessimistic,
	},
}

export default meta
