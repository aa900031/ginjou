import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { mutationMode } from '@ginjou/storybook-shared/args'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { vueRouter } from 'storybook-vue3-router'
import DeleteMany from './DeleteMany.vue'
import DeleteOne from './DeleteOne.vue'
import { renderRouteView } from './utils/sb-renders/route-view'
import { createWrapper } from './utils/wrapper'

const { argTypes: MutationModeArgTypes, args: MutationModeArgs } = mutationMode

const meta = {
	title: 'Query/Delete',
} satisfies Meta

export const Basic = {
	name: 'Basic',
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
			handlers: createPostHandlers(),
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
