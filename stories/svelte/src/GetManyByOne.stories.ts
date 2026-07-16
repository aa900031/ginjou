import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers, MOCK_POST_IDS } from '@ginjou/storybook-shared/mock-data'
import GetManyByOne from './GetManyByOne.svelte'

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
	render: (args: any) => ({
		Component: GetManyByOne as any,
		props: args,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
