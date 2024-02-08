import { h } from 'vue'
import { RouterView } from 'vue-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import ListPagination from './ListPagination.vue'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'List',
}

export const Pagination: StoryObj<typeof meta> = {
	name: 'Pagination',
	render: () => () => h(RouterView),
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
					list: '/posts',
				},
			],
			routes: [
				{
					path: '/',
					redirect: '/posts',
				},
				{
					path: '/posts',
					component: ListPagination,
				},
			],
		}),
	],
}

export default meta
