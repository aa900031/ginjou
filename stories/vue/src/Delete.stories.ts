import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import { userEvent, waitFor } from '@storybook/test'
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
	play: async ({ mount }) => {
		const canvas = await mount()

		const deleteBtn = await canvas.findByTestId('delete--6c6d3a48-8eef-4c96-a1ba-156bdfd3d389', undefined, {
			timeout: 3000,
		})

		await userEvent.click(deleteBtn)

		await waitFor(() => canvas.queryByTestId('delete--6c6d3a48-8eef-4c96-a1ba-156bdfd3d389') == null)
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
	play: async ({ mount }) => {
		const canvas = await mount()
		const deleteBtn = await canvas.findByTestId('delete-selected')
		const inputs = await canvas.findAllByTestId('pick-to-delete', {
			exact: false,
		})
		const targets = [
			inputs[0],
			inputs[1],
			inputs[2],
		]
		await Promise.all(targets.map(el => userEvent.click(el)))
		await userEvent.click(deleteBtn)

		await waitFor(() => canvas.queryAllByTestId('pick-to-delete', {
			exact: false,
		}).length === 7)
	},
}

export default meta
