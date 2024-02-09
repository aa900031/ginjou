import { h } from 'vue'
import { RouterView } from 'vue-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import { createWrapper } from './utils/wrapper'
import { createMsw } from './utils/msw'
import { mock } from './api/posts'
import ListPagination from './ListPagination.vue'

const meta: Meta = {
	title: 'List',
}

export const Pagination: StoryObj<typeof meta> = {
	name: 'Pagination',
	render: () => () => h(RouterView),
	loaders: [
		createMsw(
			factory(mock).posts.toHandlers('rest', 'https://rest-api.local'),
		),
	],
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
