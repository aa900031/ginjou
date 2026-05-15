import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { vueRouter } from 'storybook-vue3-router'
import { h } from 'vue'
import { RouterView } from 'vue-router'
import ShowBasic from './ShowBasic.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Controllers/Show',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => () => h(RouterView),
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
} satisfies StoryObj<typeof meta>

export default meta
