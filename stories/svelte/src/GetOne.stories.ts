import type { Meta, StoryObj } from '@storybook/svelte-vite'
import GetOne from './GetOne.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Query/GetOne',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: GetOne as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
