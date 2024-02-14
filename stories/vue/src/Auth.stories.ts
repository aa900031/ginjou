import { h } from 'vue'
import { RouterView } from 'vue-router'
import { vueRouter } from 'storybook-vue3-router'
import type { Meta, StoryObj } from '@storybook/vue3'
import { factory } from '@mswjs/data'
import MOCK_POSTS from '../data/mock-posts.json'
import { MockModel } from './api/posts'
import { createMsw } from './utils/msw'
import { toHandlers } from './utils/msw-data'
import { createWrapper } from './utils/wrapper'
import Auth from './Auth.vue'

const meta: Meta = {
	title: 'Auth/Authenticated',
}

export const Basic: StoryObj<typeof meta> = {
	name: 'Basic',
	render: () => () => h(Auth),
	decorators: [
		createWrapper({
			auth: true,
		}),
	],
}

export default meta
