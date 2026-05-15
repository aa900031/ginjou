import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { h } from 'vue'
import SelectBasic from './SelectBasic.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	title: 'Controllers/Select',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => () => h(SelectBasic),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
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
