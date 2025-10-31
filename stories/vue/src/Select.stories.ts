import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { factory } from '@mswjs/data'
import { h } from 'vue'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import SelectBasic from './SelectBasic.vue'
import { createMsw } from './utils/msw'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'

const meta: Meta = {
	title: 'Controllers/Select',
}

const db = factory(MockModel)
MOCK_POSTS.forEach(db.posts.create)

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(SelectBasic),
	loaders: [createMsw(toHandlers(db, 'posts', 'https://rest-api.local'))],
	decorators: [
		createWrapper({
			resources: [
				{
					name: 'posts',
				},
			],
		}),
	],
}

export default meta
