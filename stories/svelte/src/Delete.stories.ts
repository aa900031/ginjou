import type { Meta, StoryObj } from '@storybook/svelte-vite'
import DeleteMany from './DeleteMany.svelte'
import DeleteOne from './DeleteOne.svelte'
import { createPostHandlers } from './utils/posts'

const meta = {
	title: 'Query/Delete',
} satisfies Meta

export const Basic = {
	name: 'Basic',
	render: () => ({
		Component: DeleteOne as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export const Many = {
	name: 'Many',
	render: () => ({
		Component: DeleteMany as any,
	}),
	parameters: {
		msw: {
			handlers: createPostHandlers(),
		},
	},
} satisfies StoryObj<typeof meta>

export default meta
