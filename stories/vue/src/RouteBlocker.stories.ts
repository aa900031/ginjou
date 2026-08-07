import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { vueRouter } from 'storybook-vue3-router'
import { renderRouteView } from './utils/sb-renders/route-view'
import { createWrapper } from './utils/wrapper'
import PostList from './views/PostList.vue'
import PostShow from './views/PostShow.vue'
import RouteBlockerView from './views/RouteBlockerView.vue'

const meta = {
	title: 'Router/RouteBlocker',
} satisfies Meta

export const Blocker = {
	name: 'Blocker',
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
					list: '/posts',
				},
			],
			router: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: '/blocker',
			},
			{
				path: '/blocker',
				component: RouteBlockerView,
			},
			{
				path: '/posts/:id',
				component: PostShow,
			},
			{
				path: '/posts',
				component: PostList,
			},
		]),
	],
} satisfies StoryObj<typeof meta>

export default meta
