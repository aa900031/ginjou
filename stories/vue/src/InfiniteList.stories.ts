import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'

import { vueRouter } from 'storybook-vue3-router'
import { h } from 'vue'
import { RouterView } from 'vue-router'
import InfiniteListPagination from './InfiniteListPagination.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Controllers/Infinite List',
} satisfies Meta

export const Pagination = {
	name: 'Pagination',
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
					list: '/posts',
				},
			],
			router: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/posts',
			},
			{
				path: '/posts',
				component: InfiniteListPagination,
			},
		]),
	],
} satisfies StoryObj<typeof meta>

export default meta
