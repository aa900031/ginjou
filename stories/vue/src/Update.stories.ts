import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { h } from 'vue'
import UpdateMany from './UpdateMany.vue'
import UpdateOne from './UpdateOne.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Query/Update',
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
	render: () => () => h(UpdateOne),
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
	render: () => () => h(UpdateMany),
} satisfies StoryObj<typeof meta>

export default meta
