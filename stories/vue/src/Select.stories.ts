import { h } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import { createMsw } from './utils/msw'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'
import SelectBasic from './SelectBasic.vue'

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
