import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { h } from 'vue'
import GetList from './GetList.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Query/GetList',
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
	render: () => () => h(GetList),
} satisfies StoryObj<typeof meta>

export default meta
