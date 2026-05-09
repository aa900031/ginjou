import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Collection } from '@msw/data'
import { h } from 'vue'
import MOCK_POSTS from '../data/mock-posts.json'
import { PostSchema } from './api/posts'
import SelectBasic from './SelectBasic.vue'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Controllers/Select',
} satisfies Meta

const posts = new Collection({
	schema: PostSchema,
})
MOCK_POSTS.forEach(post => posts.create(post))

export const Basic = {
	name: 'Basic',
	render: () => () => h(SelectBasic),
	parameters: {
		msw: {
			handlers: toHandlers(posts, 'posts', 'https://rest-api.local'),
		},
	},
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
				},
			],
		}),
	],
} satisfies StoryObj<typeof meta>

export default meta
