import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import { h } from 'vue'
import SelectBasic from './SelectBasic.vue'
import SelectMultiple from './SelectMultiple.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	component: SelectBasic,
	title: 'Controllers/Select',
} satisfies Meta<typeof SelectBasic>

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

export const Multiple = {
	name: 'Multiple',
	render: () => () => h(SelectMultiple),
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
