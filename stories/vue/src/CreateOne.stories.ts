import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { factory } from '@mswjs/data'
import { h } from 'vue'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import CreateOne from './CreateOne.vue'
import { createMsw } from './utils/msw'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Query/CreateOne',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	loaders: [
		createMsw(toHandlers(db, 'posts', 'https://rest-api.local')),
	],
	decorators: [
		createWrapper({
			notification: true,
		}),
	],
	render: () => () => h(CreateOne),
}

export default meta
