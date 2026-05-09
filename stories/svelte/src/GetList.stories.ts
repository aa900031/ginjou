import type { Meta, StoryObj } from '@storybook/svelte-vite'
import GetList from './GetList.svelte'
import { createPostHandlers } from './utils/posts'

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
