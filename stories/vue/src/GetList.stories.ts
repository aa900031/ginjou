import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { factory } from '@mswjs/data'
import { h } from 'vue'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import GetList from './GetList.vue'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Query/GetList',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	parameters: {
		msw: {
			handlers: toHandlers(db, 'posts', 'https://rest-api.local'),
		},
	},
	decorators: [
		createWrapper({
			notification: true,
		}),
	],
	render: () => () => h(GetList),
}

export default meta
