import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPostHandlers, MOCK_POST_IDS } from '@ginjou/storybook-shared/mock-data'
import { h } from 'vue'
import GetManyByOne from './GetManyByOne.vue'
import { createWrapper } from './utils/wrapper'

const meta = {
	component: GetManyByOne,
	title: 'Query/GetManyByOne',
	argTypes: {
		ids: {
			control: { type: 'check' },
			options: MOCK_POST_IDS,
		},
	},
	args: {
		ids: [MOCK_POST_IDS.at(1)!, MOCK_POST_IDS.at(3)!, MOCK_POST_IDS.at(5)!],
	},
} satisfies Meta<typeof GetManyByOne>

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
	render: args => () => h(GetManyByOne, args),
} satisfies StoryObj<typeof meta>

export default meta
