import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { h } from 'vue'
import CreateMany from './CreateMany.vue'
import CreateOne from './CreateOne.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Query/Create',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	decorators: [
		createWrapper({
			notification: true,
		}),
	],
	render: () => () => h(CreateOne),
} satisfies StoryObj<typeof meta>

export const Many = {
	name: 'Many',
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
	decorators: [
		createWrapper({
			notification: true,
		}),
	],
	render: () => () => h(CreateMany),
} satisfies StoryObj<typeof meta>

export default meta
