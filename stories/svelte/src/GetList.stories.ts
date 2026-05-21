import type { Meta, StoryObj } from '@storybook/svelte-vite'
import { createPostHandlers } from '@ginjou/storybook-shared/mock-data'
import GetList from './GetList.svelte'

const meta = {
	title: 'Query/GetList',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: GetList as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
