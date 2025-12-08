import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Collection } from '@msw/data'
import { h } from 'vue'
import MOCK_POSTS from '../data/mock-posts.json'
import { PostSchema } from './api/posts'
import GetOne from './GetOne.vue'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Query/GetOne',
}

const posts = new Collection({
	schema: PostSchema,
})
MOCK_POSTS.forEach(post => posts.create(post))

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	parameters: {
		msw: {
			handlers: toHandlers(posts, 'posts', 'https://rest-api.local'),
		},
	},
	decorators: [
		createWrapper({
			notification: true,
		}),
	],
	render: () => () => h(GetOne),
}

export default meta
