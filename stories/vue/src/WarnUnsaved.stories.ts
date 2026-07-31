import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers, DEFAULT_POST_ID } from '@ginjou/storybook-shared/mock-data'
import { vueRouter } from 'storybook-vue3-router'
import { renderRouteView } from './utils/sb-renders/route-view'
import { createWrapper } from './utils/wrapper'
import PostList from './views/PostList.vue'
import PostShow from './views/PostShow.vue'
import WarnUnsavedForm from './views/WarnUnsavedForm.vue'

const meta = {
	title: 'Controllers/WarnUnsaved',
} satisfies Meta

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
					list: '/posts',
				},
			],
			router: true,
			notification: true,
		}),
		vueRouter([
			{
				path: '/',
				redirect: `/posts/${DEFAULT_POST_ID}/edit`,
			},
			{
				path: '/posts/:id/edit',
				component: WarnUnsavedForm,
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
